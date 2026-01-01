const Professional = require('../models/Professional');

/**
 * Get professional availability status
 * GET /api/worker/availability/:professionalId
 */
exports.getAvailability = async (req, res) => {
    try {
        const { professionalId } = req.params;

        const professional = await Professional.findById(professionalId).select('isAvailable');

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        res.status(200).json({
            success: true,
            isAvailable: professional.isAvailable
        });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Update professional availability status
 * PUT /api/worker/availability/:professionalId
 */
exports.updateAvailability = async (req, res) => {
    try {
        const { professionalId } = req.params;
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isAvailable must be a boolean'
            });
        }

        const professional = await Professional.findByIdAndUpdate(
            professionalId,
            { isAvailable },
            { new: true, select: 'isAvailable' }
        );

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        res.status(200).json({
            success: true,
            isAvailable: professional.isAvailable
        });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
