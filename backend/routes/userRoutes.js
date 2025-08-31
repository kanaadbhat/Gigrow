import express from "express";
import { getMe } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// GET /api/me - Get current user profile
router.get("/me", requireAuth, getMe);

export default router;
