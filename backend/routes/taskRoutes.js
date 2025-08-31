import express from "express";
import { testRequireAuth as requireAuth } from "../middlewares/testAuth.js";  // Using test auth for development
import { ensureUser } from "../middlewares/ensureUser.js";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getMyTasks,
    acceptTask,
    getAssignedTasks,
    requestCompletion,
    confirmCompletion
} from "../controllers/taskController.js";
import {
    validateCreateTask,
    validateUpdateTask,
    validateTaskQuery,
    validateTaskId
} from "../utils/taskValidation.js";

const router = express.Router();

// Public routes (no auth required)
// GET /api/tasks - List all tasks with filters
router.get("/", validateTaskQuery, getTasks);

// Protected routes (auth required)
// POST /api/tasks - Create a new task
router.post("/", requireAuth, ensureUser, validateCreateTask, createTask);

// GET /api/tasks/my - Get tasks posted by current user
router.get("/my", requireAuth, ensureUser, getMyTasks);

// GET /api/tasks/assigned - Get tasks assigned to current user
router.get("/assigned", requireAuth, ensureUser, getAssignedTasks);

// POST /api/tasks/:id/accept - Accept a task
router.post("/:id/accept", requireAuth, ensureUser, validateTaskId, acceptTask);

// POST /api/tasks/:id/complete/request - Request task completion (worker only)
router.post("/:id/complete/request", requireAuth, ensureUser, validateTaskId, requestCompletion);

// POST /api/tasks/:id/complete/confirm - Confirm task completion (owner only)
router.post("/:id/complete/confirm", requireAuth, ensureUser, validateTaskId, confirmCompletion);

// GET /api/tasks/:id - Get single task by ID
router.get("/:id", validateTaskId, getTaskById);

// PATCH /api/tasks/:id - Update task (only owner, only if open)
router.patch("/:id", requireAuth, ensureUser, validateTaskId, validateUpdateTask, updateTask);

// DELETE /api/tasks/:id - Delete task (only owner, only if open)
router.delete("/:id", requireAuth, ensureUser, validateTaskId, deleteTask);

export default router;
