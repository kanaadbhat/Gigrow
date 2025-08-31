// Quick test to add coins to user via wallet top-up
const API_BASE = 'http://localhost:8000';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM1dWQ2tpbjI5VERQeUtsdHhmd3VJZnBhRyIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzM2NDU2LCJpYXQiOjE3NTY2NTAwNTYsInNpZCI6InNlc3NfdGVzdF8xNzU2NjUwMDU2MDA4IiwidXNlcklkIjoidXNlcl8zMjNXVkNraW4yOVREUHlLbHR4Znd1SWZwYUcifQ.Nr9_ZR1u4Q8V604x3Zlw8wIYCTt5LDSSY3kgl-sFo6w';

async function addCoinsToUser() {
    console.log('Adding coins to user...');
    
    try {
        // Create a payment order to top up wallet
        const orderResponse = await fetch(`${API_BASE}/api/wallet/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${USER_TOKEN}`
            },
            body: JSON.stringify({
                amount: 100 // Add 100 coins
            })
        });

        if (!orderResponse.ok) {
            const error = await orderResponse.text();
            throw new Error(`Order creation failed: ${orderResponse.status} - ${error}`);
        }

        const order = await orderResponse.json();
        console.log('✅ Payment order created:', order.orderId);

        // Simulate webhook verification (bypass signature for test)
        const webhookResponse = await fetch(`${API_BASE}/api/webhooks/razorpay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                razorpay_order_id: order.orderId,
                razorpay_payment_id: 'pay_test_' + Date.now(),
                razorpay_signature: 'test_signature_bypass'
            })
        });

        if (!webhookResponse.ok) {
            const error = await webhookResponse.text();
            throw new Error(`Webhook failed: ${webhookResponse.status} - ${error}`);
        }

        const webhookResult = await webhookResponse.json();
        console.log('✅ Coins added successfully:', webhookResult);
        console.log('💰 User should now have coins for testing');

    } catch (error) {
        console.error('❌ Failed to add coins:', error.message);
    }
}

addCoinsToUser();
