const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

/**
 * Middleware to verify JWT token from HttpOnly cookie ONLY
 * Industry-standard: No Bearer tokens, only secure cookies
 */
const protect = (req, res, next) => {
  try {
    // ONLY accept token from HttpOnly cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

module.exports = { protect };
