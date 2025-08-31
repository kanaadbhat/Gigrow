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
