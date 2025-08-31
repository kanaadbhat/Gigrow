import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: { 
        type: String, 
        unique: true, 
        index: true, 
        required: true 
    },
    name: {
        type: String,
        trim: true
    },
    email: { 
        type: String, 
        index: true,
        trim: true,
        lowercase: true
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 500
    },
    skills: [{
        type: String,
        trim: true
    }],
    coins: { 
        type: Number, 
        default: 0,
        min: 0
    },
    isPro: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});


export const User = mongoose.model("User", userSchema);
