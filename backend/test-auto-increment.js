const API_BASE = 'http://localhost:8000';
const POSTER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM1dWQ2tpbjI5VERQeUtsdHhmd3VJZnBhRyIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzM2NDU2LCJpYXQiOjE3NTY2NTAwNTYsInNpZCI6InNlc3NfdGVzdF8xNzU2NjUwMDU2MDA4IiwidXNlcklkIjoidXNlcl8zMjNXVkNraW4yOVREUHlLbHR4Znd1SWZwYUcifQ.Nr9_ZR1u4Q8V604x3Zlw8wIYCTt5LDSSY3kgl-sFo6w';

async function testAutoIncrementTask() {
    console.log('=== Auto-Increment Task Test ===\n');

    try {
        // Create an auto-increment task with different urgency levels
        const tasks = [
            {
                title: 'Low Urgency Auto-Increment Task',
                description: 'This task should increment by 0.5 coins per minute',
                reward: 1,
                maxCap: 5,
                autoIncrement: true,
                category: 'technology',
                urgency: 'low',
                type: 'remote'
            },
            {
                title: 'Medium Urgency Auto-Increment Task', 
                description: 'This task should increment by 1 coin per minute',
                reward: 2,
                maxCap: 8,
                autoIncrement: true,
                category: 'technology',
                urgency: 'medium',
                type: 'remote'
            },
            {
                title: 'High Urgency Auto-Increment Task',
                description: 'This task should increment by 2 coins per minute',
                reward: 3,
                maxCap: 12,
                autoIncrement: true,
                category: 'technology', 
                urgency: 'high',
                type: 'remote'
            }
        ];

        const createdTasks = [];

        for (const taskData of tasks) {
            console.log(`Creating ${taskData.urgency} urgency task...`);
            
            const response = await fetch(`${API_BASE}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${POSTER_TOKEN}`
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Create task failed: ${response.status} - ${error}`);
            }

            const task = await response.json();
            createdTasks.push(task);
            
            console.log(`✅ Created: ${task.title}`);
            console.log(`   Initial reward: ${task.reward} coins`);
            console.log(`   Max cap: ${task.maxCap} coins`);
            console.log(`   Increment rate: ${getIncrementRate(task.urgency)} coins/min`);
            console.log(`   Task ID: ${task._id}\n`);
        }

        console.log('🔔 Tasks created! The cron job will increment rewards every minute.');
        console.log('📊 Monitor the server logs to see reward increments.');
        console.log('🕐 Wait 1-2 minutes and check task rewards to verify functionality.');
        
        // Show how to check task status
        console.log('\n📋 To check task rewards manually:');
        createdTasks.forEach(task => {
            console.log(`   GET ${API_BASE}/api/tasks/${task._id}`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

function getIncrementRate(urgency) {
    const rates = { low: 0.5, medium: 1, high: 2 };
    return rates[urgency] || 1;
}

testAutoIncrementTask();
