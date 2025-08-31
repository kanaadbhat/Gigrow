import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./utils/connectDb.js";
import cookieParser from "cookie-parser";
import { requireAuth } from "./middlewares/auth.js";
import { ensureUser } from "./middlewares/ensureUser.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import { startRewardCron } from "./cron/rewardIncrementer.js";

//Express Setup 
dotenv.config();
const app = express();
app.use(express.json());
const allowOrigin = [
    process.env.CLIENT_URL,
    process.env.SERVER_URL
]
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-user-name', 'x-user-email', 'x-admin-secret'],
    exposedHeaders: ['Set-Cookie']
}));    
app.use(cookieParser());

// Routes
app.use("/api", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api", walletRoutes); // For webhooks endpoint
app.use("/api/withdrawals", withdrawalRoutes);

// Health check route
app.get("/", (req, res) => {
    res.json({ 
        message: "Gigrow API is running", 
        timestamp: new Date().toISOString(),
        auth: req.auth ? "Authenticated" : "Not authenticated"
    });
});

//Razorpay Setup 
import Razorpay from "razorpay"
export const razorpayInstance = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
})

app.listen(process.env.PORT || 8000 , ()=> {
    connectDB();
    
    // Start the reward increment cron job after DB connection
    //startRewardCron();
    
    console.log(`Server listening on ${process.env.PORT || 8000}`)
    console.log(`MongoDb Connected`)
})
