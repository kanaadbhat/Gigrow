import express from "express";
import { getMe } from "../controllers/userController.js";
import { testRequireAuth as requireAuth } from "../middlewares/testAuth.js";  // Using test auth for development
import { ensureUser } from "../middlewares/ensureUser.js";

const router = express.Router();

// GET /api/me - Get current user profile
router.get("/me", requireAuth, ensureUser, getMe);

export default router;
