const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");
const User = require("../models/User");
const {
  createAccessToken,
} = require("../utils/authTokens");

/**
 * Admin Authentication Controller
 * Separate controller for admin-only authentication logic
 */

const buildAdminTokenPayload = (user) => ({
  userId: user._id,
  phone: user.phone,
  email: user.email,
  role: user.role,
});

const sanitizeAdminUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  location: user.location,
  status: user.status,
  createdAt: user.createdAt,
});

/**
 * Admin Login
 * POST /api/admin/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone and password",
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // Check user status
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        code: "blocked",
        message: "Your account has been blocked. Please contact support.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "inactive",
        message: `Account is ${user.status}. Please contact support.`,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create access token only (no refresh token for admin)
    const accessToken = createAccessToken(buildAdminTokenPayload(user));

    // Set auth cookie with just access token
    res.cookie(
      "accessToken",
      accessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      }
    );

    // Return user data
    res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: sanitizeAdminUser(user),
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

/**
 * Admin Logout
 * POST /api/admin/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // Clear auth cookies
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/**
 * Get Current Admin
 * GET /api/admin/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeAdminUser(user),
    });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin data",
    });
  }
};

/**
 * Refresh Admin Token
 * POST /api/admin/auth/refresh
 */
exports.refresh = async (req, res) => {
  try {
    // For admin, we just check if they're authenticated via the access token
    // No refresh token needed - access token expires in 15 minutes
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // Create new access token
    const newAccessToken = createAccessToken(buildAdminTokenPayload(user));
    
    // Set new access token cookie
    res.cookie(
      "accessToken",
      newAccessToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      }
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.clearCookie("accessToken");
    res.status(401).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

/**
 * Update Admin Profile
 * PUT /api/admin/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { name, email } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeAdminUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

/**
 * Update Admin Phone
 * PUT /api/admin/auth/update-phone
 */
exports.updatePhone = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { newPhone, password } = req.body;

    if (!userId || !newPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Check if new phone is already taken
    const existingUser = await User.findOne({
      phone: newPhone.trim(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    // Update phone
    user.phone = newPhone.trim();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      user: sanitizeAdminUser(user),
    });
  } catch (error) {
    console.error("Update phone error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating phone",
    });
  }
};

/**
 * Update Admin Password
 * PUT /api/admin/auth/update-password
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    // Clear access token - admin needs to login again
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Password updated successfully. Please login again.",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating password",
    });
  }
};

/**
 * Verify Admin Credentials
 * POST /api/admin/auth/verify-credentials
 */
exports.verifyCredentials = async (req, res) => {
  try {
    let { phone, password } = req.body;
    phone = (phone || "").trim();
    password = (password || "").toString();

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone and password",
      });
    }

    const user = await User.findById(req.user?.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    // Debug log to help track mismatches
    console.log(
      `verifyCredentials requested: user.phone=${user.phone}, provided=${phone}`
    );

    if ((user.phone || "").trim() !== phone) {
      return res.status(400).json({
        success: false,
        message: "Phone does not match current account",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Credentials verified",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Verify credentials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = exports;
