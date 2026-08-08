import jwt from 'jsonwebtoken';

// User authentication middleware
const authUser = async (req, res, next) => {
    try {
        // Express normalizes all request header names to lowercase.
        // Check 'token' first (user token), fallback to 'atoken' if provided.
        const token = req.headers.token || req.headers.atoken;

        if (!token) {
            return res.json({ 
                success: false, 
                message: 'Not Authorized, Login Again' 
            });
        }

        // Verify token against JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach userId to both req.body and req for complete controller compatibility
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;
        req.userId = decoded.id;

        next();
    } catch (error) {
        console.error("authUser Middleware Error:", error.message);
        res.json({ success: false, message: error.message || 'Authentication failed' });
    }
};

export default authUser;