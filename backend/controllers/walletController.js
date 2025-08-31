import { createOrder, verifySignature, getRazorpayInstance } from "../services/razorpay.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";

// Create Razorpay order for adding coins
export const createWalletOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: "Amount must be greater than 0"
        });
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // Generate unique receipt (max 40 chars for Razorpay)
    const shortId = req.me._id.toString().slice(-8); // last 8 chars of user id
    const receipt = `w_${shortId}_${Date.now().toString().slice(-6)}`;

    try {
        // Create Razorpay order
        const order = await createOrder(amountInPaise, receipt, {
            notes: {
                userId: req.me._id.toString(),
                purpose: "wallet_topup",
                coins: amount
            }
        });

        res.status(201).json({
            success: true,
            order: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
                receipt: order.receipt,
                notes: order.notes
            }
        });
    } catch (error) {
        console.error("Error creating wallet order:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create order",
            message: error.message
        });
    }
});

// Handle Razorpay webhook for payment verification
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const payload = JSON.stringify(req.body);
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("Webhook secret not configured");
            return res.status(500).json({
                success: false,
                error: "Webhook secret not configured"
            });
        }

        // Verify webhook signature
        const isValidSignature = verifySignature(payload, signature, webhookSecret);

        if (!isValidSignature) {
            console.error("Invalid webhook signature");
            return res.status(400).json({
                success: false,
                error: "Invalid signature"
            });
        }

        const event = req.body;
        console.log("Razorpay webhook event:", event.event);

        // Handle payment captured event
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const paymentId = payment.id;
            const orderId = payment.order_id;
            const amount = payment.amount; // Amount in paise
            const coinsToAdd = Math.floor(amount / 100); // Convert paise to coins (1 INR = 1 coin)

            // For local/dev, get userId from payment.notes
            const userId = payment.notes?.userId;

            if (!userId) {
                console.error("User ID not found in payment notes");
                return res.status(400).json({
                    success: false,
                    error: "User ID not found in payment notes"
                });
            }

            // Check for duplicate transaction (idempotency)
            const existingTransaction = await Transaction.findOne({
                "meta.razorpay_payment_id": paymentId
            });

            if (existingTransaction) {
                console.log("Transaction already processed for payment:", paymentId);
                return res.status(200).json({
                    success: true,
                    message: "Transaction already processed"
                });
            }

            // Find user and update coins
            const user = await User.findOne({ clerkId: userId });
            if (!user) {
                console.error("User not found:", userId);
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }

            // Update user coins
            user.coins += coinsToAdd;
            await user.save();

            // Create transaction record
            const transaction = new Transaction({
                user: user._id, // Use MongoDB ObjectId, not Clerk ID
                kind: "add_coins",
                amount: coinsToAdd,
                meta: {
                    razorpay_payment_id: paymentId,
                    razorpay_order_id: orderId,
                    amount_in_paise: amount,
                    payment_method: payment.method,
                    webhook_event: event.event
                }
            });

            await transaction.save();

            console.log(`Successfully added ${coinsToAdd} coins to user ${userId}`);

            res.status(200).json({
                success: true,
                message: "Payment processed successfully",
                data: {
                    userId,
                    coinsAdded: coinsToAdd,
                    newBalance: user.coins
                }
            });
        } else {
            // Handle other webhook events if needed
            console.log("Unhandled webhook event:", event.event);
            res.status(200).json({
                success: true,
                message: "Event received but not processed"
            });
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            message: error.message
        });
    }
});

// Get wallet balance and transaction history
export const getWalletInfo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's current coin balance
    const user = await User.findById(req.me._id).select('coins');

    // Get transaction history
    const transactions = await Transaction.find({ user: req.me._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('kind amount meta createdAt');

    const totalTransactions = await Transaction.countDocuments({ user: req.me._id });

    res.status(200).json({
        success: true,
        wallet: {
            balance: user.coins,
            transactions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalTransactions / parseInt(limit)),
                totalTransactions,
                hasNext: skip + transactions.length < totalTransactions,
                hasPrev: parseInt(page) > 1
            }
        }
    });
});
