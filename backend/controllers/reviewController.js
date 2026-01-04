const WorkerReview = require('../models/WorkerReview');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Submit review and payment
exports.submitReview = async (req, res) => {
    try {
        const { bookingId, rating, comment, paymentByUser } = req.body;
        const customerId = req.user.userId;

        // Validate required fields
        if (!bookingId || !rating || !comment || !paymentByUser) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Verify booking exists and belongs to customer
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customerId.toString() !== customerId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to review this booking'
            });
        }

        // Check if booking is assigned
        if (booking.status !== 'assigned') {
            return res.status(400).json({
                success: false,
                message: 'Can only review assigned bookings'
            });
        }

        // Check if review already exists
        const existingReview = await WorkerReview.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Review already submitted for this booking'
            });
        }

        // Create review
        const review = await WorkerReview.create({
            bookingId,
            customerId,
            professionalId: booking.professionalId,
            rating,
            comment
        });

        // Check if payment record exists
        let payment = await Payment.findOne({ bookingId });
        
        if (payment) {
            // Update only paymentByUser
            payment.paymentByUser = paymentByUser;
            await payment.save();
        } else {
            // Create new payment record
            payment = await Payment.create({
                bookingId,
                paymentByUser,
                paymentByWorker: null
            });
        }

        res.status(201).json({
            success: true,
            message: 'Review and payment submitted successfully',
            review,
            payment
        });

    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message
        });
    }
};

// Check if booking can be reviewed
exports.canReview = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const customerId = req.user.userId;

        // Verify booking exists and belongs to customer
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customerId.toString() !== customerId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if review exists
        const review = await WorkerReview.findOne({ bookingId });
        
        // Check if payment exists with paymentByUser
        const payment = await Payment.findOne({ bookingId });

        const canReview = booking.status === 'assigned' && 
                         !review && 
                         (!payment || payment.paymentByUser === null);

        res.status(200).json({
            success: true,
            canReview,
            hasReview: !!review,
            hasPayment: !!(payment && payment.paymentByUser !== null)
        });

    } catch (error) {
        console.error('Check review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get reviews for a professional
exports.getProfessionalReviews = async (req, res) => {
    try {
        const { professionalId } = req.params;

        const reviews = await WorkerReview.find({ professionalId })
            .populate('customerId', 'name email')
            .populate('bookingId', 'service issueType scheduledTime')
            .sort({ createdAt: -1 });

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            success: true,
            reviews,
            count: reviews.length,
            averageRating: averageRating.toFixed(1)
        });

    } catch (error) {
        console.error('Get professional reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = exports;
