import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get basic platform statistics
// @route   GET /api/stats/basic
// @access  Public
export const getBasicStats = asyncHandler(async (req, res) => {
    try {
        // Run all queries in parallel for better performance
        const [totalUsers, totalTasks, openTasks] = await Promise.all([
            User.countDocuments(),
            Task.countDocuments(),
            Task.countDocuments({ status: 'open' })
        ]);

        // Calculate additional stats
        const completedTasks = await Task.countDocuments({ status: 'completed' });
        const assignedTasks = await Task.countDocuments({ status: 'assigned' });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalTasks,
                openTasks,
                completedTasks,
                assignedTasks,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch platform statistics',
            message: error.message
        });
    }
});

// @desc    Get detailed platform analytics (optional - for future use)
// @route   GET /api/stats/detailed
// @access  Public
export const getDetailedStats = asyncHandler(async (req, res) => {
    try {
        // Aggregate statistics
        const tasksByUrgency = await Task.aggregate([
            {
                $group: {
                    _id: '$urgency',
                    count: { $sum: 1 },
                    avgReward: { $avg: '$reward' },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const tasksByType = await Task.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgReward: { $avg: '$reward' }
                }
            }
        ]);

        const tasksByStatus = await Task.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Most viewed tasks
        const topViewedTasks = await Task.find()
            .select('title views reward status')
            .sort({ views: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            analytics: {
                tasksByUrgency,
                tasksByType,
                tasksByStatus,
                topViewedTasks,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch detailed analytics',
            message: error.message
        });
    }
});
