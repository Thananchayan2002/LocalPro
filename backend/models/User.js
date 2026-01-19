const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false, // Optional for passwordless auth
      unique: true,
      sparse: true, // Allow null values while maintaining uniqueness
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional for passwordless auth
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false, // E.164 format phone number
      unique: true,
      sparse: true, // Allow null values while maintaining uniqueness
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
  },
);

// Index for faster phone lookups
userSchema.index({ phone: 1 });

module.exports = mongoose.model("User", userSchema);
