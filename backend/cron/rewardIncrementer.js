import cron from 'node-cron';
import { Task } from '../models/Task.js';

// Rate mapping by urgency (coins per minute)
const URGENCY_RATES = {
    low: 0.5,
    medium: 1,
    high: 2
};

/**
 * Start the reward increment cron job
 * Runs every minute to increase rewards for auto-increment tasks
 */
export function startRewardCron() {
    console.log('🚀 Starting reward increment cron job...');
    
    // Schedule cron job to run every minute
    cron.schedule('* * * * *', async () => {
        try {
            await incrementTaskRewards();
        } catch (error) {
            console.error('❌ Error in reward increment cron:', error.message);
        }
    });
    
    console.log('✅ Reward increment cron job scheduled (every minute)');
}

/**
 * Increment rewards for eligible tasks
 */
async function incrementTaskRewards() {
    try {
        // Find all open tasks with autoIncrement enabled
        const autoIncrementTasks = await Task.find({
            status: 'open',
            autoIncrement: true,
            $expr: { $lt: ['$reward', '$maxCap'] } // Only tasks that haven't reached maxCap
        });

        if (autoIncrementTasks.length === 0) {
            console.log('⏱️  No auto-increment tasks to process');
            return;
        }

        console.log(`⚡ Processing ${autoIncrementTasks.length} auto-increment tasks...`);
        
        let updatedCount = 0;
        
        for (const task of autoIncrementTasks) {
            const rate = URGENCY_RATES[task.urgency] || URGENCY_RATES.medium;
            const newReward = Math.min(task.reward + rate, task.maxCap);
            
            // Only update if reward actually changed
            if (newReward !== task.reward) {
                await Task.findByIdAndUpdate(
                    task._id,
                    { 
                        reward: newReward,
                        updatedAt: new Date()
                    }
                );
                
                updatedCount++;
                console.log(`💰 Task ${task._id}: ${task.reward} → ${newReward} coins (${task.urgency} urgency, +${rate}/min)`);
                
                // Log when task reaches maxCap
                if (newReward === task.maxCap) {
                    console.log(`🎯 Task ${task._id} reached maxCap (${task.maxCap} coins)`);
                }
            }
        }
        
        if (updatedCount > 0) {
            console.log(`✅ Updated ${updatedCount} task rewards`);
        }
        
    } catch (error) {
        console.error('❌ Error incrementing task rewards:', error.message);
        throw error;
    }
}

// Export for manual testing
export { incrementTaskRewards };
