import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const atoken = (authHeader && authHeader.startsWith('Bearer '))
            ? authHeader.split(' ')[1]
            : req.headers.atoken;

        if (!atoken) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized: Admin token missing. Please log in.'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("Critical Error: JWT_SECRET is not set in environment variables!");
            return res.status(500).json({
                success: false,
                message: 'Internal server configuration error.'
            });
        }

        // 3. Cryptographically verify the token
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

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
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please log in again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid or tampered token. Please log in again.'
        });
    }
};

export default authAdmin;