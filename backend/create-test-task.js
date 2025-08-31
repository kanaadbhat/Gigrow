// Test auto-increment functionality with Postman/API calls
const API_BASE = 'http://localhost:8000';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM1dWQ2tpbjI5VERQeUtsdHhmd3VJZnBhRyIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzM2NDU2LCJpYXQiOjE3NTY2NTAwNTYsInNpZCI6InNlc3NfdGVzdF8xNzU2NjUwMDU2MDA4IiwidXNlcklkIjoidXNlcl8zMjNXVkNraW4yOVREUHlLbHR4Znd1SWZwYUcifQ.Nr9_ZR1u4Q8V604x3Zlw8wIYCTt5LDSSY3kgl-sFo6w';

async function createAutoIncrementTask() {
    console.log('🎯 Creating auto-increment test task...\n');

    try {
        const response = await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${USER_TOKEN}`
            },
            body: JSON.stringify({
                title: 'Test Auto-Increment Task',
                description: 'This task will increment by 2 coins per minute (high urgency)',
                reward: 5,
                maxCap: 20,
                autoIncrement: true,
                urgency: 'high',
                type: 'remote'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed: ${response.status} - ${error}`);
        }

        const task = await response.json();
        console.log('✅ Auto-increment task created!');
        console.log(`📋 Task ID: ${task._id}`);
        console.log(`💰 Initial reward: ${task.reward} coins`);
        console.log(`🎯 Max cap: ${task.maxCap} coins`);
        console.log(`⚡ Urgency: ${task.urgency} (+2 coins/minute)`);
        console.log(`🔗 Check progress: GET ${API_BASE}/api/tasks/${task._id}`);
        
        console.log('\n⏰ Monitor the server logs for cron messages like:');
        console.log('   "⚡ Processing 1 auto-increment tasks..."');
        console.log('   "💰 Task XYZ: 5 → 7 coins (high urgency, +2/min)"');
        
        return task._id;

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createAutoIncrementTask();
