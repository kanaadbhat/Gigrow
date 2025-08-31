import express from "express";
import { testRequireAuth as requireAuth } from "../middlewares/testAuth.js";  // Using test auth for development
import { ensureUser } from "../middlewares/ensureUser.js";
import {
    createWalletOrder,
    handleRazorpayWebhook,
    getWalletInfo
} from "../controllers/walletController.js";
import {
    validateCreateOrder,
    validateWalletQuery
} from "../utils/walletValidation.js";

const router = express.Router();

// Protected routes (auth required)
// POST /api/wallet/create-order - Create Razorpay order for adding coins
router.post("/create-order", requireAuth, ensureUser, validateCreateOrder, createWalletOrder);

// GET /api/wallet - Get wallet balance and transaction history
router.get("/", requireAuth, ensureUser, validateWalletQuery, getWalletInfo);

// Public webhook route (no auth, but signature verification)
// POST /api/webhooks/razorpay - Handle Razorpay webhook events
router.post("/webhooks/razorpay", express.raw({ type: 'application/json' }), handleRazorpayWebhook);

export default router;
