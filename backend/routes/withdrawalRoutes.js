import express from "express";
import { testRequireAuth as requireAuth } from "../middlewares/testAuth.js";
import { ensureUser } from "../middlewares/ensureUser.js";
import {
    requestWithdrawal,
    getMyWithdrawals,
    getAdminRevenue
} from "../controllers/withdrawalController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

// User routes (auth required)
// POST /api/withdrawals - Request a withdrawal (auto-processed)
router.post("/", requireAuth, ensureUser, requestWithdrawal);

// GET /api/withdrawals/my - Get user's withdrawal history
router.get("/my", requireAuth, ensureUser, getMyWithdrawals);

// Admin routes (admin auth required)
// GET /api/withdrawals/admin/revenue - Get admin revenue and platform stats
router.get("/admin/revenue", requireAdmin, getAdminRevenue);

export default router;
