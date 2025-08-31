const API_BASE = 'http://localhost:8000';

// Test tokens (from your test middleware)
const POSTER_TOKEN = 'test-token-1';  // Owner of the task
const WORKER_TOKEN = 'test-token-2';  // Worker who will complete the task

async function testTaskCompletion() {
    console.log('=== Task Completion Workflow Test ===\n');

    try {
        // Step 1: Create a task as poster
        console.log('1. Creating task as poster...');
        const createResponse = await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${POSTER_TOKEN}`
            },
            body: JSON.stringify({
                title: 'Test Task for Completion',
                description: 'This task will test the completion workflow',
                reward: 50,
                category: 'technology',
                urgency: 'medium'
            })
        });

        if (!createResponse.ok) {
            throw new Error(`Create task failed: ${createResponse.status}`);
        }

        const task = await createResponse.json();
        console.log(`✅ Task created: ${task.title} (ID: ${task._id})`);
        console.log(`💰 Task reward: ${task.reward} coins\n`);

        // Step 2: Accept the task as worker
        console.log('2. Accepting task as worker...');
        const acceptResponse = await fetch(`${API_BASE}/api/tasks/${task._id}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WORKER_TOKEN}`
            }
        });

        if (!acceptResponse.ok) {
            throw new Error(`Accept task failed: ${acceptResponse.status}`);
        }

        const acceptedTask = await acceptResponse.json();
        console.log(`✅ Task accepted by worker`);
        console.log(`📝 Task status: ${acceptedTask.status}\n`);

        // Step 3: Request completion as worker
        console.log('3. Requesting task completion as worker...');
        const requestResponse = await fetch(`${API_BASE}/api/tasks/${task._id}/complete/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WORKER_TOKEN}`
            }
        });

        if (!requestResponse.ok) {
            const error = await requestResponse.text();
            throw new Error(`Request completion failed: ${requestResponse.status} - ${error}`);
        }

        const requestedTask = await requestResponse.json();
        console.log(`✅ Completion requested`);
        console.log(`📝 Task status: ${requestedTask.status}`);
        console.log(`🔄 Meta state:`, requestedTask.meta);
        console.log();

        // Step 4: Confirm completion as poster
        console.log('4. Confirming task completion as poster...');
        const confirmResponse = await fetch(`${API_BASE}/api/tasks/${task._id}/complete/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${POSTER_TOKEN}`
            }
        });

        if (!confirmResponse.ok) {
            const error = await confirmResponse.text();
            throw new Error(`Confirm completion failed: ${confirmResponse.status} - ${error}`);
        }

        const completedTask = await confirmResponse.json();
        console.log(`✅ Task completion confirmed!`);
        console.log(`📝 Final status: ${completedTask.status}`);
        console.log(`💰 Worker payment: ${completedTask.reward} coins`);
        console.log(`💸 Owner refund: ${completedTask.meta?.refunded || 0} coins`);
        console.log(`🔄 Meta state:`, completedTask.meta);

        console.log('\n=== Test Completed Successfully! ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testTaskCompletion();
