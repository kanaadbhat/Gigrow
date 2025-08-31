import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new task
export const createTask = asyncHandler(async (req, res) => {
    const taskData = {
        ...req.body,
        postedBy: req.me._id
    };

    const task = new Task(taskData);
    await task.save();

    // Populate the postedBy field for response
    await task.populate('postedBy', 'name email');

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task
    });
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
    if (task.postedBy.toString() !== req.me._id.toString()) {
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
    if (task.postedBy.toString() !== req.me._id.toString()) {
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
    
    const filter = { postedBy: req.me._id };
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
