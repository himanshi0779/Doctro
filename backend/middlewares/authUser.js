import jwt from 'jsonwebtoken';

// User (Patient) authentication middleware with RBAC
const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.headers.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized: User token missing. Please log in again.'
            });
        }

        // Verify cryptographic signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Enforce Patient/User Role
        if (decoded.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Patient permissions required.'
            });
        }

        // Attach userId to request object for downstream controllers
        req.userId = decoded.id;
        
        // Backward compatibility fallback for controllers expecting req.body.userId
        if (req.body && typeof req.body === 'object') {
            req.body.userId = decoded.id;
        }

        next();
    } catch (error) {
        console.error("authUser Middleware Error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

export default authUser;