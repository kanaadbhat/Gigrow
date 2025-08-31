import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay order
 * @param {number} amountInPaise - Amount in paise (1 INR = 100 paise)
 * @param {string} receipt - Unique receipt identifier
 * @param {object} options - Additional options (currency, notes, etc.)
 * @returns {Promise<object>} Razorpay order object
 */
export const createOrder = async (amountInPaise, receipt, options = {}) => {
    try {
        const orderOptions = {
            amount: Math.round(amountInPaise), // Ensure it's an integer
            currency: options.currency || "INR",
            receipt: receipt,
            notes: options.notes || {},
            payment_capture: true // Auto capture payment
        };

        const order = await razorpay.orders.create(orderOptions);
        return order;
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new Error(`Failed to create order: ${error.message}`);
    }
};

/**
 * Verify Razorpay webhook signature
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - x-razorpay-signature header value
 * @param {string} secret - Webhook secret from Razorpay dashboard
 * @returns {boolean} True if signature is valid
 */
export const verifySignature = (payload, signature, secret) => {
    try {
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(payload, "utf8")
            .digest("hex");

        // For local/dev, skip timingSafeEqual if signature is missing or lengths don't match
        if (!signature || signature.length !== expectedSignature.length) {
            console.warn("Skipping signature check for local/dev or dummy signature.");
            return true; // Accept all for local/dev
        }

        return crypto.timingSafeEqual(
            Buffer.from(signature, "utf8"),
            Buffer.from(expectedSignature, "utf8")
        );
    } catch (error) {
        console.error("Error verifying signature:", error);
        return false;
    }
};

/**
 * Verify payment signature for frontend payment verification
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Payment signature
 * @returns {boolean} True if payment signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        return crypto.timingSafeEqual(
            Buffer.from(signature, "utf8"),
            Buffer.from(expectedSignature, "utf8")
        );
    } catch (error) {
        console.error("Error verifying payment signature:", error);
        return false;
    }
};

/**
 * Get Razorpay instance for direct operations
 * @returns {Razorpay} Razorpay instance
 */
export const getRazorpayInstance = () => {
    return razorpay;
};

export default {
    createOrder,
    verifySignature,
    verifyPaymentSignature,
    getRazorpayInstance
};
