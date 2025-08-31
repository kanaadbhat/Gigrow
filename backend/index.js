import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./utils/connectDb.js";
import cookieParser from "cookie-parser";
import { requireAuth } from "./middlewares/auth.js";
import { ensureUser } from "./middlewares/ensureUser.js";
import userRoutes from "./routes/userRoutes.js";

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
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-user-name', 'x-user-email'],
    exposedHeaders: ['Set-Cookie']
}));    
app.use(cookieParser());


// Ensure User Middleware (auto-upsert user on authenticated requests)
app.use(ensureUser);

// Routes
app.use("/api", userRoutes);

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
    console.log(`Server listening on ${process.env.PORT || 8000}`)
})
