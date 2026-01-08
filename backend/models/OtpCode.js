const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true, // Index for faster lookups
      // Store in E.164 format (e.g., +94771234567)
    },
    code: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["SIGNUP", "LOGIN", "RESET_PASSWORD", "VERIFY_PHONE"],
      required: true,
      default: "LOGIN",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete after expiration
    },
    used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster lookup (phone + purpose + not used)
otpCodeSchema.index({ phone: 1, purpose: 1, used: 1 });

// Automatically delete expired OTPs
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpCode", otpCodeSchema);
