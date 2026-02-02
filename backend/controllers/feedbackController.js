const Feedback = require("../models/Feedback");
const User = require("../models/User");

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { userId, feedbackType, rating, subject, message, experience, name, email } = req.body;

    // Validate required fields
    if (!feedbackType || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Verify user exists if userId is provided
    let userName = name;
    let userEmail = email;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      userName = name || user.name;
      userEmail = email || user.email;
    }

    // Create feedback
    const feedback = new Feedback({
      userId: userId || null,
      feedbackType,
      rating: rating || 0,
      subject,
      message,
      experience: experience || "good",
      name: userName,
      email: userEmail,
      status: "new",
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
      error: error.message,
    });
  }
};

// Get all feedback (for admin dashboard)
exports.getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, feedbackType } = req.query;

    const query = {};
    if (status) query.status = status;
    if (feedbackType) query.feedbackType = feedbackType;

    const skip = (page - 1) * limit;

    const feedback = await Feedback.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
      error: error.message,
    });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const newFeedback = await Feedback.countDocuments({ status: "new" });
    const byType = await Feedback.aggregate([
      {
        $group: {
          _id: "$feedbackType",
          count: { $sum: 1 },
        },
      },
    ]);
    const byRating = await Feedback.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const byExperience = await Feedback.aggregate([
      {
        $group: {
          _id: "$experience",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        newFeedback,
        byType,
        byRating,
        byExperience,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback statistics",
      error: error.message,
    });
  }
};

// Get featured feedback for testimonials (rating >= 4)
exports.getFeaturedFeedback = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const feedback = await Feedback.find({
      rating: { $gte: 1 },
      status: "new",
    })
      .populate("userId", "name phone")
      .sort({ rating: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select("name rating message createdAt email");

    // Map to testimonial format
    const testimonials = feedback.map((item) => ({
      _id: item._id,
      name: item.name,
      rating: item.rating,
      comment: item.message,
      date: new Date(item.createdAt).toLocaleDateString(),
      type: item.feedbackType,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`,
    }));

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error("Error fetching featured feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching testimonials",
      error: error.message,
    });
  }
};

// Mark feedback as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback marked as read",
      data: feedback,
    });
  } catch (error) {
    console.error("Error marking feedback as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback",
      error: error.message,
    });
  }
};
