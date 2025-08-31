import { User } from "../models/User.js";

export const ensureUser = async (req, res, next) => {
    try {
        // Skip if no auth or userId
        if (!req.auth || !req.auth.userId) {
            return next();
        }

        const clerkId = req.auth.userId;
        
        // Get optional user data from headers (sent by frontend)
        const name = req.headers['x-user-name'] || "Test User";
        const email = req.headers['x-user-email'] || `${clerkId}@test.com`;

        // Prepare update data with defaults for test users
        const updateData = {
            clerkId,
            name,
            email
        };

        console.log("ensureUser: Looking for user with clerkId:", clerkId);

        // Upsert user: find by clerkId, update if exists, create if not
        const user = await User.findOneAndUpdate(
            { clerkId },
            { $set: updateData },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true 
            }
        );

        console.log("ensureUser: User found/created:", user._id.toString());

        // Attach user to request object
        req.user = user;
        
        next();
    } catch (error) {
        console.error("Error in ensureUser middleware:", error);
        res.status(500).json({ 
            error: "Internal server error", 
            message: "Failed to process user authentication" 
        });
    }
};
