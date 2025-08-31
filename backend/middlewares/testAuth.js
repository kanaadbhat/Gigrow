import jwt from 'jsonwebtoken';

// Temporary test auth middleware for development
export const testRequireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: "Unauthorized", 
                message: "Valid authentication required - missing Bearer token" 
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Try to decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Mock the req.auth structure that Clerk would provide
        req.auth = {
            userId: decoded.sub || decoded.userId
        };
        
        console.log("Test auth successful for user:", req.auth.userId);
        next();
        
    } catch (error) {
        console.error("Test auth failed:", error.message);
        return res.status(401).json({ 
            error: "Unauthorized", 
            message: "Invalid or expired token" 
        });
    }
};

// Export both for flexibility
export { requireAuth } from "@clerk/express";
