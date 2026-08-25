import jwt from 'jsonwebtoken';

// Admin authentication middleware with strict identity verification
const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.headers.atoken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized: Admin token missing. Please log in again.'
            });
        }

        // Verify cryptographic signature
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Strict Admin Role and Email Verification
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const tokenEmail = decoded.email?.trim().toLowerCase();

        if (decoded.role !== 'admin' || tokenEmail !== adminEmail) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Super Admin permissions required.'
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Admin Auth Middleware Error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

export default authAdmin;