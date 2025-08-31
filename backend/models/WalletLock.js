import mongoose from "mongoose";

const walletLockSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    task: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Task", 
        required: true
    },
    maxLocked: { 
        type: Number, 
        required: true,
        min: 0
    },
    used: { 
        type: Number, 
        default: 0,
        min: 0
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Create compound indexes
walletLockSchema.index({ owner: 1, task: 1 });

// Ensure used amount doesn't exceed maxLocked
walletLockSchema.pre('save', function(next) {
    if (this.used > this.maxLocked) {
        const error = new Error('Used amount cannot exceed maxLocked amount');
        return next(error);
    }
    next();
});

export const WalletLock = mongoose.model("WalletLock", walletLockSchema);
