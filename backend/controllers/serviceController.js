const Service = require("../models/Service");
const Issue = require("../models/Issue");

// Get popular services (trending or fallback to first 5)
exports.getPopularServices = async (req, res) => {
  try {
    // Strict boolean check for trending
    const trendingServices = await Service.find({ trending: true }).sort({
      createdAt: -1,
    });

    if (trendingServices.length > 0) {
      return res.status(200).json({
        success: true,
        count: trendingServices.length,
        data: trendingServices,
      });
    }

    // Fallback: first 5 services
    const fallbackServices = await Service.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      count: fallbackServices.length,
      data: fallbackServices,
    });
  } catch (error) {
    console.error("Get popular services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get all services error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Create new service
exports.createService = async (req, res) => {
  try {
    const { service, description, iconName } = req.body;

    // Validation
    if (!service || !description || !iconName) {
      return res.status(400).json({
        success: false,
        message: "Please provide service name, icon name and description",
      });
    }

    // Check if service already exists
    const existingService = await Service.findOne({
      service: service.trim(),
    });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
    }

    const newService = await Service.create({
      service: service.trim(),
      iconName: iconName.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: newService,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { service, description, iconName } = req.body;

    // Validation
    if (!service || !description || !iconName) {
      return res.status(400).json({
        success: false,
        message: "Please provide service name, icon name and description",
      });
    }

    // Check if service exists
    const existingService = await Service.findById(req.params.id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check if new service name conflicts with another service
    const duplicateService = await Service.findOne({
      service: service.trim(),
      _id: { $ne: req.params.id },
    });

    if (duplicateService) {
      return res.status(409).json({
        success: false,
        message: "Service name already exists",
      });
    }

    existingService.service = service.trim();
    existingService.iconName = iconName.trim();
    existingService.description = description.trim();
    await existingService.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: existingService,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Delete service (cascade deletes related issues)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Delete all related issues first
    const deletedIssues = await Issue.deleteMany({ serviceId: req.params.id });

    // Delete the service
    await Service.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Service deleted successfully. ${deletedIssues.deletedCount} related issue(s) also deleted.`,
      deletedIssuesCount: deletedIssues.deletedCount,
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
