import express from "express";
import { getMe, getMyTransactions } from "../controllers/userController.js";
import { testRequireAuth as requireAuth } from "../middlewares/testAuth.js";  // Using test auth for development
import { ensureUser } from "../middlewares/ensureUser.js";

const router = express.Router();

// GET /api/me - Get current user profile
router.get("/me", requireAuth, ensureUser, getMe);

// GET /api/transactions/my - Get user's transaction history
router.get("/transactions/my", requireAuth, ensureUser, getMyTransactions);

export default router;
