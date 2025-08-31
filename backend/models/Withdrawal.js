import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    amount: { 
        type: Number, 
        required: true,
        min: 0.01,
        validate: {
            validator: function(value) {
                return value > 0;
            },
            message: 'Withdrawal amount must be greater than 0'
        }
    },
    feeBps: { 
        type: Number, 
        default: 300, // 3% default fee in basis points
        min: 0,
        max: 10000 // Max 100%
    },
    status: { 
        type: String, 
        enum: ["completed", "failed"], 
        default: "completed", // Auto-processed, so defaults to completed
        index: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    processedAt: {
        type: Date,
        default: Date.now // Auto-processed immediately
    },
    failureReason: {
        type: String,
        trim: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        // Store transaction IDs, admin fee details, etc.
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        index: true
    },
    adminFeeTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
withdrawalSchema.index({ user: 1, status: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

// Virtual for calculated fee amount
withdrawalSchema.virtual('feeAmount').get(function() {
    return Math.round((this.amount * this.feeBps / 10000) * 100) / 100;
});

// Virtual for net amount user receives
withdrawalSchema.virtual('netAmount').get(function() {
    return Math.round((this.amount - this.feeAmount) * 100) / 100;
});

// Ensure virtuals are included in JSON output
withdrawalSchema.set('toJSON', { virtuals: true });
withdrawalSchema.set('toObject', { virtuals: true });

// Pre-save middleware for validation
withdrawalSchema.pre('save', function(next) {
    // Set processedAt when withdrawal is created (auto-processing)
    if (this.isNew && !this.processedAt) {
        this.processedAt = new Date();
    }
    next();
});

// Instance method to check if withdrawal was successful
withdrawalSchema.methods.isSuccessful = function() {
    return this.status === 'completed';
};

// Instance method to get processing summary
withdrawalSchema.methods.getProcessingSummary = function() {
    return {
        withdrawalId: this._id,
        amount: this.amount,
        feeAmount: this.feeAmount,
        netAmount: this.netAmount,
        status: this.status,
        processedAt: this.processedAt,
        failureReason: this.failureReason
    };
};

// Static method for admin analytics
withdrawalSchema.statics.getRevenueStats = async function(startDate, endDate) {
    const match = {
        status: 'completed',
        processedAt: {
            $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            $lte: endDate || new Date()
        }
    };

    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalWithdrawals: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
                totalFees: { $sum: { $multiply: ["$amount", { $divide: ["$feeBps", 10000] }] } },
                avgWithdrawal: { $avg: "$amount" },
                avgFee: { $avg: { $multiply: ["$amount", { $divide: ["$feeBps", 10000] }] } }
            }
        },
        {
            $project: {
                _id: 0,
                totalWithdrawals: 1,
                totalAmount: { $round: ["$totalAmount", 2] },
                totalFees: { $round: ["$totalFees", 2] },
                avgWithdrawal: { $round: ["$avgWithdrawal", 2] },
                avgFee: { $round: ["$avgFee", 2] }
            }
        }
    ]);

    return stats[0] || {
        totalWithdrawals: 0,
        totalAmount: 0,
        totalFees: 0,
        avgWithdrawal: 0,
        avgFee: 0
    };
};

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
