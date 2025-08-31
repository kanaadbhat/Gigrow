// Test script for task acceptance and coin locking functionality
import dotenv from "dotenv";

dotenv.config();

const testToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM1dWQ2tpbjI5VERQeUtsdHhmd3VJZnBhRyIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzM2NDU2LCJpYXQiOjE3NTY2NTAwNTYsInNpZCI6InNlc3NfdGVzdF8xNzU2NjUwMDU2MDA4IiwidXNlcklkIjoidXNlcl8zMjNXVkNraW4yOVREUHlLbHR4Znd1SWZwYUcifQ.Nr9_ZR1u4Q8V604x3Zlw8wIYCTt5LDSSY3kgl-sFo6w";

console.log("🎯 Task Acceptance & Coin Lock Test Examples");
console.log("============================================");

console.log("\n1. 💰 Create Task (with coin locking)");
console.log("POST http://localhost:8000/api/tasks");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);
console.log("  Content-Type: application/json");
console.log("Body (autoIncrement=false, locks reward amount):");
console.log(JSON.stringify({
  title: "Debug React App",
  description: "Fix routing issues in my React application",
  type: "remote",
  urgency: "high",
  peopleRequired: 1,
  skillsRequired: [
    { skill: "React", count: 1 },
    { skill: "JavaScript", count: 1 }
  ],
  reward: 50,
  autoIncrement: false,
  notes: "Must be completed within 2 days"
}, null, 2));

console.log("\nBody (autoIncrement=true, locks maxCap amount):");
console.log(JSON.stringify({
  title: "Build Landing Page",
  description: "Create a responsive landing page",
  type: "remote",
  urgency: "medium", 
  peopleRequired: 1,
  skillsRequired: [
    { skill: "HTML", count: 1 },
    { skill: "CSS", count: 1 }
  ],
  reward: 30,
  autoIncrement: true,
  maxCap: 80,
  notes: "Payment increases based on quality"
}, null, 2));

console.log("\n2. ✅ Accept Task");
console.log("POST http://localhost:8000/api/tasks/:taskId/accept");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);
console.log("(No body needed)");

console.log("\n3. 📋 Get My Posted Tasks");
console.log("GET http://localhost:8000/api/tasks/my");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);

console.log("\n4. 📋 Get My Assigned Tasks");
console.log("GET http://localhost:8000/api/tasks/assigned");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);

console.log("\n5. 💼 Get Wallet Info (see locked coins)");
console.log("GET http://localhost:8000/api/wallet");
console.log("Headers:");
console.log(`  Authorization: ${testToken}`);

console.log("\n📝 Expected Flow:");
console.log("==================");
console.log("1. User creates task → Coins locked from poster");
console.log("2. Worker accepts task → Task status: 'assigned'");
console.log("3. Check wallet → See 'spend_lock' transaction");
console.log("4. Check my tasks → See posted tasks");
console.log("5. Check assigned → See accepted tasks");

console.log("\n⚠️  Business Rules:");
console.log("===================");
console.log("• Poster must have enough coins for reward/maxCap");
console.log("• Coins are locked when task is created");
console.log("• MVP: Only single assignee allowed");
console.log("• Can't accept your own task");
console.log("• Can only accept 'open' tasks");
console.log("• autoIncrement=true locks maxCap, false locks reward");

console.log("\n🧪 Test Scenarios:");
console.log("==================");
console.log("• Create task with insufficient coins → Should fail");
console.log("• Accept open task → Should succeed");
console.log("• Accept already assigned task → Should fail");
console.log("• Accept own task → Should fail");
console.log("• Check wallet after task creation → See locked coins");
