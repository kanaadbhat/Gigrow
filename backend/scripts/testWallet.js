// Test script for wallet functionality
import dotenv from "dotenv";

dotenv.config();

const testToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM1dWQ2tpbjI5VERQeUtsdHhmd3VJZnBhRyIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzM2NDU2LCJpYXQiOjE3NTY2NTAwNTYsInNpZCI6InNlc3NfdGVzdF8xNzU2NjUwMDU2MDA4IiwidXNlcklkIjoidXNlcl8zMjNXVkNraW4yOVREUHlLbHR4Znd1SWZwYUcifQ.Nr9_ZR1u4Q8V604x3Zlw8wIYCTt5LDSSY3kgl-sFo6w";

console.log("🧪 Wallet API Test Examples");
console.log("==========================");

console.log("\n1. 💰 Create Wallet Order (Add Coins)");
console.log("POST http://localhost:8000/api/wallet/create-order");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);
console.log("  Content-Type: application/json");
console.log("Body:");
console.log(JSON.stringify({ amount: 100 }, null, 2));

console.log("\n2. 📊 Get Wallet Info");
console.log("GET http://localhost:8000/api/wallet");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);

console.log("\n3. 🔔 Webhook Test (Simulate Razorpay webhook)");
console.log("POST http://localhost:8000/api/webhooks/razorpay");
console.log("Headers:");
console.log("  Content-Type: application/json");
console.log("  x-razorpay-signature: <webhook_signature>");
console.log("Body (example payment.captured event):");

const webhookPayload = {
    "entity": "event",
    "account_id": "acc_test_123",
    "event": "payment.captured",
    "contains": ["payment"],
    "payload": {
        "payment": {
            "entity": {
                "id": "pay_test_123456789",
                "entity": "payment",
                "amount": 10000, // 100 INR in paise
                "currency": "INR",
                "status": "captured",
                "order_id": "order_test_123456789",
                "method": "card",
                "captured": true,
                "notes": {
                    "userId": "user_323WVCkin29TDPyKltxfwuIfpaG",
                    "purpose": "wallet_topup"
                }
            }
        }
    },
    "created_at": Math.floor(Date.now() / 1000)
};

console.log(JSON.stringify(webhookPayload, null, 2));

console.log("\n📝 Expected Flow:");
console.log("1. Create order → Get order_id, key, amount");
console.log("2. Use order details in frontend payment");
console.log("3. Razorpay sends webhook → User coins increased");
console.log("4. Check wallet info → See new balance and transaction");

console.log("\n⚠️  Important Notes:");
console.log("- Set RAZORPAY_WEBHOOK_SECRET in .env file");
console.log("- Use Razorpay test keys for development");
console.log("- Webhook signature verification is implemented");
console.log("- All amounts are in INR (1 INR = 100 paise)");
