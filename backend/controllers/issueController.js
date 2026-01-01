const Issue = require('../models/Issue');
const Service = require('../models/Service');

// Get all issues with pagination and optional service filter
exports.getAllIssues = async (req, res) => {
    try {
        const { page = 1, limit = 10, serviceId } = req.query;

        // Build filter
        const filter = {};
        if (serviceId) {
            filter.serviceId = serviceId;
        }

        // Calculate skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get total count for pagination
        const totalCount = await Issue.countDocuments(filter);

        // Get issues with pagination
        const issues = await Issue.find(filter)
            .populate('serviceId', 'service')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: issues.length,
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            currentPage: parseInt(page),
            data: issues
        });
    } catch (error) {
        console.error('Get all issues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get issue by ID
exports.getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('serviceId', 'service');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.status(200).json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.error('Get issue by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Create new issue
exports.createIssue = async (req, res) => {
    try {
        const { serviceId, issueName, basicCost } = req.body;

        // Validation
        if (!serviceId || !issueName || basicCost === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide service, issue name, and basic cost'
            });
        }

        if (basicCost < 0) {
            return res.status(400).json({
                success: false,
                message: 'Basic cost cannot be negative'
            });
        }

        // Verify service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const newIssue = await Issue.create({
            serviceId,
            issueName: issueName.trim(),
            basicCost: parseFloat(basicCost)
        });

        // Populate service data
        await newIssue.populate('serviceId', 'service');

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: newIssue
        });
    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update issue
exports.updateIssue = async (req, res) => {
    try {
        const { serviceId, issueName, basicCost } = req.body;

        // Validation
        if (!serviceId || !issueName || basicCost === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide service, issue name, and basic cost'
            });
        }

        if (basicCost < 0) {
            return res.status(400).json({
                success: false,
                message: 'Basic cost cannot be negative'
            });
        }

        // Check if issue exists
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Verify service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        issue.serviceId = serviceId;
        issue.issueName = issueName.trim();
        issue.basicCost = parseFloat(basicCost);
        await issue.save();

        // Populate service data
        await issue.populate('serviceId', 'service');

        res.status(200).json({
            success: true,
            message: 'Issue updated successfully',
            data: issue
        });
    } catch (error) {
        console.error('Update issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete issue
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        await Issue.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Issue deleted successfully'
        });
    } catch (error) {
        console.error('Delete issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};
