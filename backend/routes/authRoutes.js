const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/login - Legacy phone-based login
router.post("/login", authController.login);

// POST /api/auth/login-email - Email/password login (SECONDARY method)
router.post("/login-email", authController.loginEmail);

// POST /api/auth/register - Legacy email-based registration
router.post("/register", authController.register);

// POST /api/auth/register-phone - Phone-based registration (PRIMARY method)
router.post("/register-phone", authController.registerPhone);

// POST /api/auth/logout
router.post("/logout", protect, authController.logout);

// GET /api/auth/profile - Get current user's profile (authenticated)
router.get("/profile", protect, authController.getMyProfile);

// POST /api/auth/verify-credentials
router.post("/verify-credentials", protect, authController.verifyCredentials);

// PUT /api/auth/update-phone
router.put("/update-phone", protect, authController.updatePhone);

// PUT /api/auth/update-email (deprecated - kept for backward compatibility)
router.put("/update-email", protect, authController.updateEmail);

// PUT /api/auth/update-password
router.put("/update-password", protect, authController.updatePassword);

// GET /api/auth/user/:id
router.get("/user/:id", protect, authController.getUserById);

// GET /api/auth/user/phone/:phone
router.get("/user/phone/:phone", authController.getUserByPhone);

// POST /api/auth/check-user-by-phone - Check if user exists by phone (for new flow)
router.post("/check-user-by-phone", authController.checkUserByPhone);

// POST /api/auth/login-with-phone - Login existing user after OTP verification
router.post("/login-with-phone", authController.loginWithPhone);

// POST /api/auth/complete-profile - Complete profile and create user after OTP verification
router.post("/complete-profile", authController.completeProfile);

module.exports = router;
