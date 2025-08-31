import { Withdrawal } from "../models/Withdrawal.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Get admin user ID (set this in your .env file)
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "admin_gigrow_2024";

// @desc    Request and process withdrawal automatically
// @route   POST /api/withdrawals
// @access  Private
export const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount, feeBps = 300 } = req.body;
    const userId = req.user._id;

    // Simple validation
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: "Amount must be a positive number"
        });
    }

    if (amount > 10000) {
        return res.status(400).json({
            success: false,
            error: "Maximum withdrawal amount is 10,000 coins"
        });
    }

    if (feeBps && (isNaN(feeBps) || feeBps < 0 || feeBps > 10000)) {
        return res.status(400).json({
            success: false,
            error: "Fee basis points must be between 0 and 10000"
        });
    }

    // Start transaction session for data consistency
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            // Get user with lock to prevent race conditions
            const user = await User.findById(userId).session(session);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }

            // Check if user has sufficient coins
            if (user.coins < amount) {
                return res.status(400).json({
                    success: false,
                    error: "Insufficient funds",
                    message: `You have ${user.coins} coins but requested ${amount} coins`
                });
            }

            // Calculate fee and net amount
            const feeAmount = Math.round((amount * feeBps / 10000) * 100) / 100;
            const netAmount = amount - feeAmount;

            // 1. Deduct full amount from user's coins
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $inc: { coins: -amount } },
                { new: true, session }
            );

            // 2. Add fee to admin's coins (if fee > 0)
            let adminUser = null;
            if (feeAmount > 0) {
                // Find or create admin user
                adminUser = await User.findOneAndUpdate(
                    { clerkId: ADMIN_USER_ID },
                    { 
                        $inc: { coins: feeAmount },
                        $setOnInsert: { 
                            clerkId: ADMIN_USER_ID,
                            email: 'admin@gigrow.com',
                            role: 'admin'
                        }
                    },
                    { upsert: true, new: true, session }
                );
            }

            // 3. Create withdrawal transaction for user
            const withdrawTransaction = new Transaction({
                user: userId,
                kind: "withdraw",
                amount: amount,
                description: `Withdrawal - ${amount} coins (fee: ${feeAmount}, net payout: ${netAmount})`,
                metadata: {
                    withdrawalAmount: amount,
                    feeAmount: feeAmount,
                    netAmount: netAmount,
                    feeBps: feeBps,
                    adminUserId: adminUser?._id
                }
            });
            await withdrawTransaction.save({ session });

            // 4. Create fee income transaction for admin (if fee > 0)
            let feeTransaction = null;
            if (feeAmount > 0 && adminUser) {
                feeTransaction = new Transaction({
                    user: adminUser._id,
                    kind: "fee_income",
                    amount: feeAmount,
                    description: `Withdrawal fee from ${user.clerkId}`,
                    metadata: {
                        sourceUserId: userId,
                        sourceUserClerkId: user.clerkId,
                        originalAmount: amount,
                        feeBps: feeBps,
                        netPayout: netAmount
                    }
                });
                await feeTransaction.save({ session });
            }

            // 5. Create withdrawal record (automatically processed)
            const withdrawal = new Withdrawal({
                user: userId,
                amount: amount,
                feeBps: feeBps,
                status: "completed", // Automatically processed
                transactionId: withdrawTransaction._id,
                adminFeeTransactionId: feeTransaction?._id,
                metadata: {
                    userBalanceBefore: user.coins,
                    userBalanceAfter: updatedUser.coins,
                    adminUserId: adminUser?._id,
                    feeAmount: feeAmount,
                    netAmount: netAmount,
                    processedAt: new Date(),
                    processedBy: "system_auto"
                }
            });
            await withdrawal.save({ session });

            await withdrawal.populate('user', 'clerkId email coins');

            console.log(`💸 Auto-withdrawal: ${netAmount} USD to ${user.clerkId}, ${feeAmount} fee to admin`);

            res.status(201).json({
                success: true,
                message: "Withdrawal processed successfully",
                withdrawal: {
                    _id: withdrawal._id,
                    amount: withdrawal.amount,
                    feeAmount: withdrawal.feeAmount,
                    netAmount: withdrawal.netAmount,
                    status: withdrawal.status,
                    processedAt: withdrawal.processedAt,
                    createdAt: withdrawal.createdAt
                },
                user: {
                    coins: updatedUser.coins
                }
            });
        });
    } catch (error) {
        console.error("Withdrawal processing error:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to process withdrawal",
            message: error.message
        });
    } finally {
        await session.endSession();
    }
});

// @desc    Get user's withdrawal history
// @route   GET /api/withdrawals/my
// @access  Private
export const getMyWithdrawals = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { user: userId };
    if (status) {
        query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    try {
        const [withdrawals, total] = await Promise.all([
            Withdrawal.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'clerkId email'),
            Withdrawal.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            withdrawals,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Get withdrawals error:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch withdrawals",
            message: error.message
        });
    }
});

// @desc    Get admin revenue and platform stats
// @route   GET /api/admin/revenue
// @access  Admin
export const getAdminRevenue = asyncHandler(async (req, res) => {
    try {
        // Find admin user
        const adminUser = await User.findOne({ clerkId: ADMIN_USER_ID });
        
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                error: "Admin user not found"
            });
        }

        // Get admin's fee transactions
        const feeTransactions = await Transaction.find({
            user: adminUser._id,
            kind: "fee_income"
        }).sort({ createdAt: -1 }).limit(100);

        // Calculate total revenue
        const totalRevenue = feeTransactions.reduce((sum, tx) => sum + tx.amount, 0);

        // Get withdrawal stats
        const withdrawalStats = await Withdrawal.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        res.json({
            success: true,
            adminWallet: {
                coins: adminUser.coins,
                totalFeeRevenue: totalRevenue
            },
            recentFeeTransactions: feeTransactions.slice(0, 20),
            withdrawalStats: withdrawalStats,
            platformMetrics: {
                totalWithdrawals: withdrawalStats.reduce((sum, stat) => sum + stat.count, 0),
                totalWithdrawnAmount: withdrawalStats.reduce((sum, stat) => sum + stat.totalAmount, 0)
            }
        });
    } catch (error) {
        console.error("Admin revenue error:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch admin revenue",
            message: error.message
        });
    }
});
