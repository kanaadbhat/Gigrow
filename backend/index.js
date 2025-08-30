import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./utils/connectDb.js";
import cookieParser from "cookie-parser";

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
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));    
app.use(cookieParser());

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
