import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../models/Transaction.js";

export const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by ensureUser middleware
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User not found"
        });
    }

    // Return user profile data
    const userProfile = {
        clerkId: req.user.clerkId,
        name: req.user.name,
        email: req.user.email,
        bio: req.user.bio,
        skills: req.user.skills,
        coins: req.user.coins,
        isPro: req.user.isPro,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
    };

    res.status(200).json({
        success: true,
        user: userProfile
    });
});

// @desc    Get user's transaction history
// @route   GET /api/transactions/my
// @access  Private
export const getMyTransactions = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { kind, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { user: userId };
    if (kind) {
        query.kind = kind;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    try {
        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'clerkId email'),
            Transaction.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        // Calculate balance changes
        const transactionsWithBalance = transactions.map(tx => {
            let balanceChange = 0;
            const isCredit = ['add_coins', 'payout', 'refund', 'fee_income'].includes(tx.kind);
            const isDebit = ['spend_lock', 'withdraw', 'fee'].includes(tx.kind);
            
            if (isCredit) {
                balanceChange = tx.amount;
            } else if (isDebit) {
                balanceChange = -tx.amount;
            }

            return {
                ...tx.toObject(),
                balanceChange: balanceChange,
                type: isCredit ? 'credit' : 'debit'
            };
        });

        res.json({
            success: true,
            transactions: transactionsWithBalance,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            summary: {
                currentBalance: req.user.coins,
                totalTransactions: total
            }
        });
    } catch (error) {
        console.error("Get transactions error:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch transactions",
            message: error.message
        });
    }
});
