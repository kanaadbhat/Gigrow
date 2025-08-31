import { User } from "../models/User.js";

export const ensureUser = async (req, res, next) => {
    try {
        // Skip if no auth or userId
        if (!req.auth || !req.auth.userId) {
            return next();
        }

        const clerkId = req.auth.userId;
        
        // Get optional user data from headers (sent by frontend)
        const name = req.headers['x-user-name'];
        const email = req.headers['x-user-email'];

        // Prepare update data (only include fields that exist)
        const updateData = {
            clerkId
        };
        
        if (name) updateData.name = name;
        if (email) updateData.email = email;

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

        // Attach user to request object
        req.me = user;
        
        next();
    } catch (error) {
        console.error("Error in ensureUser middleware:", error);
        res.status(500).json({ 
            error: "Internal server error", 
            message: "Failed to process user authentication" 
        });
    }
};
