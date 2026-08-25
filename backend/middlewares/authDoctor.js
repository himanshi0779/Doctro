import jwt from 'jsonwebtoken';

// Doctor authentication middleware with strict RBAC
const authDoctor = async (req, res, next) => {
    try {
        // Support custom header 'dtoken' as well as standard 'Authorization: Bearer <token>'
        const authHeader = req.headers.authorization;
        const dtoken = req.headers.dtoken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        if (!dtoken) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized: Doctor token missing. Please log in again.'
            });
        }

        // Verify cryptographic signature
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

        // Enforce Role-Based Access Control (RBAC)
        if (decoded.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Doctor permissions required.'
            });
        }

        // Attach doctor ID to request object for downstream controllers
        req.doctorId = decoded.id;
        next();

    } catch (error) {
        console.error('Doctor Auth Middleware Error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

export default authDoctor;