import express from "express";
import { getBasicStats, getDetailedStats } from "../controllers/statsController.js";

const router = express.Router();

// Public routes (no authentication required)
// GET /api/stats/basic - Get basic platform statistics
router.get("/basic", getBasicStats);

// GET /api/stats/detailed - Get detailed analytics (optional)
router.get("/detailed", getDetailedStats);

export default router;
