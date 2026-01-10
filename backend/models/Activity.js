const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "general" },
    action: { type: String, required: true },
    device: { type: String, default: "unknown" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

ActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", ActivitySchema);
