// Simple test token generator for development
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function generateTestToken() {
  const userId = "user_323WVCkin29TDPyKltxfwuIfpaG";
  
  // Create a test JWT that mimics Clerk's structure
  const payload = {
    sub: userId,
    iss: "https://test-clerk.dev",
    aud: "test-audience",
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    sid: "sess_test_" + Date.now(),
    // Add custom claims that your app might use
    userId: userId
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);
  
  console.log("🔑 Test JWT Token Generated!");
  console.log("📋 Copy this token for testing:");
  console.log("Bearer " + token);
  console.log("\n📖 Usage Instructions:");
  console.log("1. Copy the token above");
  console.log("2. In your API client (Postman/Insomnia/curl), add header:");
  console.log("   Authorization: Bearer " + token);
  console.log("3. Test your protected routes");
  console.log("\n🧪 Test endpoints:");
  console.log("   POST http://localhost:8000/api/tasks");
  console.log("   GET  http://localhost:8000/api/me");
  console.log("   GET  http://localhost:8000/api/tasks/my");
  
  return token;
}

generateTestToken();


//user1 token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM1dWQ2tpbjI5VERQeUtsdHhmd3VJZnBhRyIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzM2NDU2LCJpYXQiOjE3NTY2NTAwNTYsInNpZCI6InNlc3NfdGVzdF8xNzU2NjUwMDU2MDA4IiwidXNlcklkIjoidXNlcl8zMjNXVkNraW4yOVREUHlLbHR4Znd1SWZwYUcifQ.Nr9_ZR1u4Q8V604x3Zlw8wIYCTt5LDSSY3kgl-sFo6w      
//user2 token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMyM2R5WUlra1pKc3hDQWt6dExEdnhpSzF6ViIsImlzcyI6Imh0dHBzOi8vdGVzdC1jbGVyay5kZXYiLCJhdWQiOiJ0ZXN0LWF1ZGllbmNlIiwiZXhwIjoxNzU2NzQ0NDgzLCJpYXQiOjE3NTY2NTgwODMsInNpZCI6InNlc3NfdGVzdF8xNzU2NjU4MDgzMDcwIiwidXNlcklkIjoidXNlcl8zMjNkeVlJa2taSnN4Q0FrenRMRHZ4aUsxelYifQ.iTtefGi8tQcYtBk-Ta6MNES40mzCYL8PGKL8ZeG59PA