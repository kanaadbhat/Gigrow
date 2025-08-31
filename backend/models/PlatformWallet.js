import mongoose from "mongoose";

const platformWalletSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["fees", "reserve", "operational"],
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalReceived: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number, 
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
platformWalletSchema.index({ type: 1 });

export const PlatformWallet = mongoose.model("PlatformWallet", platformWalletSchema);
