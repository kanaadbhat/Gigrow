import { asyncHandler } from "../utils/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
    // req.me is populated by ensureUser middleware
    if (!req.me) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "User not found"
        });
    }

    // Return user profile data
    const userProfile = {
        clerkId: req.me.clerkId,
        name: req.me.name,
        email: req.me.email,
        bio: req.me.bio,
        skills: req.me.skills,
        coins: req.me.coins,
        isPro: req.me.isPro,
        createdAt: req.me.createdAt,
        updatedAt: req.me.updatedAt
    };

    res.status(200).json({
        success: true,
        user: userProfile
    });
});
