import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    kind: { 
        type: String, 
        enum: ["add_coins", "spend_lock", "payout", "refund", "withdraw", "fee"], 
        required: true,
        index: true
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0  // positive numbers only
    },
    meta: { 
        type: Object, 
        default: {} 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Create compound indexes for better query performance
transactionSchema.index({ user: 1, kind: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ "meta.razorpay_payment_id": 1 }); // For idempotency checks

export const Transaction = mongoose.model("Transaction", transactionSchema);
