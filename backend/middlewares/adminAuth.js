// Admin authentication middleware
export const requireAdmin = (req, res, next) => {
    try {
        const adminSecret = req.headers['x-admin-secret'];
        
        if (!adminSecret) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
                message: "Admin authentication required - missing x-admin-secret header"
            });
        }
        
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({
                success: false,
                error: "Forbidden",
                message: "Invalid admin credentials"
            });
        }
        
        // Add admin identifier to request for logging
        req.admin = {
            id: "admin", // Could be more sophisticated admin user system
            authenticatedAt: new Date()
        };
        
        console.log("Admin authentication successful for settlement operation");
        next();
        
    } catch (error) {
        console.error("Admin auth error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "Admin authentication failed"
        });
    }
};
