const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { rateLimit } = require("../middleware/rateLimit");

const phoneEnumLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message:
    "Too many requests. Please wait a bit before trying this again.",
  keyPrefix: "phone-enum",
});

// POST /api/auth/adminlogin
router.post('/adminlogin', authController.adminlogin);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/register (customer signup)
router.post("/register", authController.register);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// POST /api/auth/refresh
router.post("/refresh", authController.refresh);

// GET /api/auth/me
router.get("/me", protect, authController.me);

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
router.get("/user/phone/:phone", protect, authController.getUserByPhone);

// POST /api/auth/check-user-by-phone - Check if user exists by phone (for new flow)
router.post("/check-user-by-phone", phoneEnumLimiter, authController.checkUserByPhone);

// POST /api/auth/login-with-phone - Login existing user after OTP verification
router.post("/login-with-phone", authController.loginWithPhone);

// POST /api/auth/complete-profile - Complete profile and create user after OTP verification
router.post("/complete-profile", authController.completeProfile);

module.exports = router;
