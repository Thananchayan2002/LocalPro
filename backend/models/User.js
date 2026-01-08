const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,

      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional - using passwordless OTP authentication
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "professional", "admin"],
      required: true,
      default: "customer",
    },
    location: {
      type: String,
      trim: true,
    },
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending", "pause"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster phone number lookups (primary identifier)
userSchema.index({ phoneNumber: 1 });

// Index for email lookups (secondary identifier)
userSchema.index({ email: 1 });

// Index for legacy phone field
userSchema.index({ phone: 1 });

module.exports = mongoose.model("User", userSchema);
