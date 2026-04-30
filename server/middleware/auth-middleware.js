const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../key");
const User = require("../models/user-schema");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Invalid token. User not found." });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
