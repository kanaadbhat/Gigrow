import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: function() {
            return this.kind !== 'platform_fee_income' && this.kind !== 'platform_expense';
        },
        index: true
    },
    kind: { 
        type: String, 
        enum: ["add_coins", "spend_lock", "payout", "refund", "withdraw", "fee", "fee_income"], 
        required: true,
        index: true
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0  // positive numbers only
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    metadata: { 
        type: mongoose.Schema.Types.Mixed, 
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
transactionSchema.index({ "metadata.razorpay_payment_id": 1 }); // For idempotency checks

export const Transaction = mongoose.model("Transaction", transactionSchema);
