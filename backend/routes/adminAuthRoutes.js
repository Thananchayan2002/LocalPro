const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { protect } = require("../middleware/authMiddleware");

/**
 * Admin Authentication Routes
 * Separate endpoints for admin authentication
 */

// POST /api/admin/auth/login - Admin login
router.post("/login", adminAuthController.login);

// POST /api/admin/auth/logout - Admin logout
router.post("/logout", protect, adminAuthController.logout);

// GET /api/admin/auth/me - Get current admin
router.get("/me", protect, adminAuthController.getMe);

// POST /api/admin/auth/refresh - Refresh admin token
router.post("/refresh", adminAuthController.refresh);

// PUT /api/admin/auth/profile - Update admin profile
router.put("/profile", protect, adminAuthController.updateProfile);

// PUT /api/admin/auth/update-phone - Update admin phone
router.put("/update-phone", protect, adminAuthController.updatePhone);

// PUT /api/admin/auth/update-password - Update admin password
router.put("/update-password", protect, adminAuthController.updatePassword);

// POST /api/admin/auth/verify-credentials - Verify admin credentials
router.post("/verify-credentials", protect, adminAuthController.verifyCredentials);

module.exports = router;
