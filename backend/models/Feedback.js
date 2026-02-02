const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    feedbackType: {
      type: String,
      enum: ["general", "suggestion", "issue", "feature"],
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    subject: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      enum: ["excellent", "good", "average", "poor"],
      default: "good",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
