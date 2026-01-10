const Activity = require("../models/Activity");

// Create new activity and broadcast via Socket.io
exports.createActivity = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      type = "general",
      action,
      device = "unknown",
      metadata = {},
    } = req.body || {};

    if (!action) {
      return res
        .status(400)
        .json({ success: false, message: "'action' is required" });
    }

    const activity = await Activity.create({
      user: userId,
      type,
      action,
      device,
      metadata,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`activities:${userId}`).emit("activity:new", {
        id: activity._id,
        user: userId,
        type: activity.type,
        action: activity.action,
        device: activity.device,
        metadata: activity.metadata,
        timestamp: activity.createdAt,
      });
    }

    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error("createActivity error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error creating activity" });
  }
};

// Get recent activities for the authenticated user
exports.getMyActivities = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { limit = 20, page = 1 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Activity.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Activity.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: items.map((a) => ({
        id: a._id,
        user: a.user,
        type: a.type,
        action: a.action,
        device: a.device,
        metadata: a.metadata || {},
        timestamp: a.createdAt,
      })),
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (error) {
    console.error("getMyActivities error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching activities" });
  }
};
