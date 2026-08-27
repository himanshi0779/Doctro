import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.headers.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: User token missing. Please log in.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables!");
      return res.status(500).json({
        success: false,
        message: "Internal server configuration error.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Patient permissions required.",
      });
    }
    req.userId = decoded.id;
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or tampered token. Please log in again.",
    });
  }
};

export default authUser;