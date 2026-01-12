const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");

// POST /api/otp/send - Send OTP to phone number
router.post("/send", otpController.sendOTP);

// POST /api/otp/verify - Verify OTP
router.post("/verify", otpController.verifyOTP);

module.exports = router;
