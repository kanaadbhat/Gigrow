import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { WalletLock } from "../models/WalletLock.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new task
export const createTask = asyncHandler(async (req, res) => {
    const taskData = {
        ...req.body,
        postedBy: req.user._id
    };

    // Determine how much to lock
    const maxLocked = taskData.autoIncrement ? taskData.maxCap : taskData.reward;

    // Check if poster has enough coins
    const poster = await User.findById(req.user._id);
    if (poster.coins < maxLocked) {
        return res.status(400).json({
            success: false,
            error: 'Insufficient coins',
            message: `You need at least ${maxLocked} coins to post this task. You have ${poster.coins} coins.`
        });
    }

    // Start transaction-like operation
    try {
        // Create the task
        const task = new Task(taskData);
        await task.save();

        // Deduct coins from poster
        poster.coins -= maxLocked;
        await poster.save();

        // Create wallet lock
        const walletLock = new WalletLock({
            owner: req.user._id,
            task: task._id,
            maxLocked: maxLocked,
            used: 0
        });
        await walletLock.save();

        // Create transaction record
        const transaction = new Transaction({
            user: req.user._id,
            kind: "spend_lock",
            amount: maxLocked,
            meta: {
                taskId: task._id.toString(),
                taskTitle: task.title,
                lockType: taskData.autoIncrement ? "maxCap" : "reward"
            }
        });
        await transaction.save();

        // Populate the task for response
        await task.populate('postedBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task,
            walletInfo: {
                coinsLocked: maxLocked,
                remainingBalance: poster.coins
            }
        });
    } catch (error) {
        console.error("Error creating task with coin lock:", error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

// Get all tasks with filters
export const getTasks = asyncHandler(async (req, res) => {
    const { status, type, urgency, q, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (urgency) filter.urgency = urgency;
    
    // Add text search for title and description
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get tasks with pagination
    const tasks = await Task.find(filter)
        .populate('postedBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.status(200).json({
        success: true,
        tasks,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalTasks: total,
            hasNext: skip + tasks.length < total,
            hasPrev: parseInt(page) > 1
        }
    });
});

// Get single task by ID
export const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('postedBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    res.status(200).json({
        success: true,
        task
    });
});

// Update task (only owner can update and only if status is open)
export const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    // Check if user is the owner
    if (task.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            error: 'You can only update your own tasks'
        });
    }

    // Check if task is still open
    if (task.status !== 'open') {
        return res.status(400).json({
            success: false,
            error: 'You can only edit tasks that are still open'
        });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    ).populate('postedBy', 'name email')
     .populate('assignedTo', 'name email');

    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: updatedTask
    });
});

// Delete task (only owner can delete and only if status is open)
export const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    // Check if user is the owner
    if (task.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            error: 'You can only delete your own tasks'
        });
    }

    // Check if task is still open
    if (task.status !== 'open') {
        return res.status(400).json({
            success: false,
            error: 'You can only delete tasks that are still open'
        });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
    });
});

// Get tasks posted by current user
export const getMyTasks = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { postedBy: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
        success: true,
        tasks,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalTasks: total,
            hasNext: skip + tasks.length < total,
            hasPrev: parseInt(page) > 1
        }
    });
});

// Accept a task (MVP: single assignee)
export const acceptTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('postedBy', 'name email');

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    // Check if task is still open
    if (task.status !== 'open') {
        return res.status(400).json({
            success: false,
            error: 'Task is no longer available for acceptance',
            currentStatus: task.status
        });
    }

    // Check if user is trying to accept their own task
    if (task.postedBy._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
            success: false,
            error: 'You cannot accept your own task'
        });
    }

    // For MVP: single assignee only
    if (task.assignedTo && task.assignedTo.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Task has already been accepted by another user'
        });
    }

    try {
        // Update task: assign to current user and change status
        task.assignedTo = [req.user._id];
        task.status = 'assigned';
        await task.save();

        // Populate the assignedTo field for response
        await task.populate('assignedTo', 'name email');

        res.status(200).json({
            success: true,
            message: 'Task accepted successfully',
            task
        });
    } catch (error) {
        console.error("Error accepting task:", error);
        res.status(500).json({
            success: false,
            error: 'Failed to accept task',
            message: error.message
        });
    }
});

// Get tasks assigned to current user
export const getAssignedTasks = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tasks = await Task.find(filter)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
        success: true,
        tasks,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalTasks: total,
            hasNext: skip + tasks.length < total,
            hasPrev: parseInt(page) > 1
        }
    });
});

// Worker requests completion
export const requestCompletion = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('postedBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    // Check if task is assigned
    if (task.status !== 'assigned') {
        return res.status(400).json({
            success: false,
            error: 'Task must be assigned to request completion',
            currentStatus: task.status
        });
    }

    // Check if current user is the assigned worker
    const isAssignedWorker = task.assignedTo.some(worker => 
        worker._id.toString() === req.user._id.toString()
    );

    if (!isAssignedWorker) {
        return res.status(403).json({
            success: false,
            error: 'Only the assigned worker can request completion'
        });
    }

    // Check if completion already requested
    if (task.meta && task.meta.workerRequested) {
        return res.status(400).json({
            success: false,
            error: 'Completion has already been requested'
        });
    }

    try {
        // Update task meta to mark completion requested
        if (!task.meta) task.meta = {};
        task.meta.workerRequested = true;
        task.meta.completionRequestedAt = new Date();
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Completion request submitted successfully',
            task
        });
    } catch (error) {
        console.error("Error requesting completion:", error);
        res.status(500).json({
            success: false,
            error: 'Failed to request completion',
            message: error.message
        });
    }
});

// Owner confirms completion and processes payout
export const confirmCompletion = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('postedBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found'
        });
    }

    // Check if current user is the task owner
    if (task.postedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            error: 'Only the task owner can confirm completion'
        });
    }

    // Check if task is assigned
    if (task.status !== 'assigned') {
        return res.status(400).json({
            success: false,
            error: 'Task must be assigned to confirm completion',
            currentStatus: task.status
        });
    }

    // Check if worker has requested completion
    if (!task.meta || !task.meta.workerRequested) {
        return res.status(400).json({
            success: false,
            error: 'Worker must request completion first'
        });
    }

    // Concurrency guard - check status again
    const currentTask = await Task.findById(req.params.id);
    if (currentTask.status !== 'assigned') {
        return res.status(400).json({
            success: false,
            error: 'Task status changed during processing'
        });
    }

    try {
        // Find the wallet lock for this task
        const walletLock = await WalletLock.findOne({ task: task._id });
        if (!walletLock) {
            return res.status(500).json({
                success: false,
                error: 'Wallet lock not found for this task'
            });
        }

        // Calculate payout amounts
        const finalReward = task.reward;
        const used = finalReward;
        const refund = Math.max(0, walletLock.maxLocked - used);

        // Get worker (first assignee for MVP)
        const worker = await User.findById(task.assignedTo[0]._id);
        const poster = await User.findById(task.postedBy._id);

        if (!worker || !poster) {
            return res.status(500).json({
                success: false,
                error: 'Worker or poster not found'
            });
        }

        // Update wallet lock
        walletLock.used = used;
        await walletLock.save();

        // Credit worker with the final reward
        worker.coins += used;
        await worker.save();

        // Create payout transaction for worker
        const payoutTransaction = new Transaction({
            user: worker._id,
            kind: "payout",
            amount: used,
            meta: {
                taskId: task._id.toString(),
                taskTitle: task.title,
                fromUser: poster._id.toString(),
                walletLockId: walletLock._id.toString()
            }
        });
        await payoutTransaction.save();

        // Refund unused amount to poster if any
        let refundTransaction = null;
        if (refund > 0) {
            poster.coins += refund;
            await poster.save();

            refundTransaction = new Transaction({
                user: poster._id,
                kind: "refund",
                amount: refund,
                meta: {
                    taskId: task._id.toString(),
                    taskTitle: task.title,
                    originalLocked: walletLock.maxLocked,
                    finalUsed: used,
                    walletLockId: walletLock._id.toString()
                }
            });
            await refundTransaction.save();
        }

        // Update task status to completed
        task.status = 'completed';
        task.meta.completedAt = new Date();
        task.meta.confirmedBy = poster._id;
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Task completed and payment processed successfully',
            task,
            payoutInfo: {
                workerPaid: used,
                refundToOwner: refund,
                workerNewBalance: worker.coins,
                ownerNewBalance: poster.coins
            }
        });

    } catch (error) {
        console.error("Error confirming completion:", error);
        res.status(500).json({
            success: false,
            error: 'Failed to process completion',
            message: error.message
        });
    }
});
