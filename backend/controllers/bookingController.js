const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Professional = require('../models/Professional');
const ClientReview = require('../models/ClientReview');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            service,
            issueType,
            description,
            scheduledTime,
            location
        } = req.body;

        // Validate required fields
        if (!service || !issueType || !description || !scheduledTime || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate location fields
        if (!location.city || !location.area || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide complete location information'
            });
        }

        // Get customer ID from authenticated user
        const customerId = req.user.userId;

        // Verify customer exists and is a customer
        const customer = await User.findById(customerId);
        if (!customer || customer.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can create bookings'
            });
        }

        // Verify service exists
        const serviceExists = await Service.findOne({ service: service });
        if (!serviceExists) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Create booking
        const booking = await Booking.create({
            customerId,
            service,
            issueType,
            description,
            scheduledTime: new Date(scheduledTime),
            location,
            status: 'requested',
            duration: 2 // Default 2 hours
        });

        // Populate customer details
        await booking.populate('customerId', 'name email phone');

        // Emit new booking event via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('newBooking', {
                booking: booking.toObject(),
                service: booking.service,
                district: booking.location.district
            });
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message
        });
    }
};

// Get all bookings for a customer
exports.getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user.userId;

        const bookings = await Booking.find({ customerId })
            .populate('customerId', 'name email phone')
            .populate('professionalId', 'name email phone')
            .sort({ createdAt: -1 });

        // Fetch payment data for each booking
        const bookingsWithPayments = await Promise.all(
            bookings.map(async (booking) => {
                const payment = await Payment.findOne({ bookingId: booking._id });
                return {
                    ...booking.toObject(),
                    payment: payment ? { paymentByUser: payment.paymentByUser } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            bookings: bookingsWithPayments,
            count: bookingsWithPayments.length
        });

    } catch (error) {
        console.error('Get customer bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get all bookings for a professional
exports.getProfessionalBookings = async (req, res) => {
    try {
        const professionalId = req.user.userId;

        const bookings = await Booking.find({ professionalId })
            .populate('customerId', 'name email phone')
            .populate('professionalId', 'name email phone')
            .sort({ createdAt: -1 });

        // Fetch payment data for each booking
        const bookingsWithPayments = await Promise.all(
            bookings.map(async (booking) => {
                const payment = await Payment.findOne({ bookingId: booking._id });
                return {
                    ...booking.toObject(),
                    payment: payment ? {
                        paymentByUser: payment.paymentByUser,
                        paymentByWorker: payment.paymentByWorker
                    } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            bookings: bookingsWithPayments,
            count: bookingsWithPayments.length
        });

    } catch (error) {
        console.error('Get professional bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
    try {
        const { status, service } = req.query;

        let query = {};
        if (status) query.status = status;
        if (service) query.service = service;

        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('professionalId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            bookings,
            count: bookings.length
        });

    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('customerId', 'name email phone location')
            .populate('professionalId', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, professionalId } = req.body;

        const validStatuses = ['requested', 'assigned', 'inspecting', 'approved', 'inProgress', 'completed', 'cancelled', 'paid', 'verified'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = status;

        // Set paidAt timestamp when status changes to paid
        if (status === 'paid') {
            booking.paidAt = new Date();
        }

        // Set verifiedAt timestamp when status changes to verified
        if (status === 'verified') {
            booking.verifiedAt = new Date();
        }

        // Assign professional if provided
        if (professionalId && status === 'assigned') {
            const professional = await User.findById(professionalId);
            if (!professional || professional.role !== 'professional') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid professional ID'
                });
            }
            booking.professionalId = professionalId;

            // Increment totalJobs in Professional model when booking is accepted
            try {
                // Find professional by phone number (linking User and Professional models)
                const professionalRecord = await Professional.findOne({ phone: professional.phone });
                if (professionalRecord) {
                    professionalRecord.totalJobs = (professionalRecord.totalJobs || 0) + 1;
                    await professionalRecord.save();
                    console.log(`Incremented totalJobs for professional ${professionalRecord.name} to ${professionalRecord.totalJobs}`);
                } else {
                    console.warn(`Professional record not found for user ${professionalId}`);
                }
            } catch (err) {
                console.error('Error incrementing totalJobs:', err);
                // Don't fail the booking if this fails, just log it
            }
        }

        await booking.save();

        await booking.populate('customerId', 'name email phone');
        await booking.populate('professionalId', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            booking
        });

    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Cancel booking (customer only)
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.userId;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify the booking belongs to the customer
        if (booking.customerId.toString() !== customerId) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own bookings'
            });
        }

        // Check if booking can be cancelled
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel ${booking.status} booking`
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete booking (admin only)
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });

    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get professional details by phone (for workers to get their profile data)
exports.getProfessionalByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        const Professional = require('../models/Professional');
        
        const professional = await Professional.findOne({ phone })
            .select('service district phone name email');

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: professional
        });

    } catch (error) {
        console.error('Get professional by phone error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Complete booking with client review and payment
exports.completeBooking = async (req, res) => {
    try {
        const { bookingId, rating, comment, payment } = req.body;
        const professionalId = req.user.userId;

        // Validate required fields
        if (!bookingId || !rating || !comment || payment === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (bookingId, rating, comment, payment)'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify the professional is assigned to this booking
        if (booking.professionalId?.toString() !== professionalId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to complete this booking'
            });
        }

        // Check if booking is already completed
        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This booking is already completed'
            });
        }

        // Create or update client review
        await ClientReview.findOneAndUpdate(
            { bookingId },
            { bookingId, rating, comment },
            { upsert: true, new: true }
        );

        // Create or update payment
        await Payment.findOneAndUpdate(
            { bookingId },
            { $set: { paymentByWorker: payment } },
            { upsert: true, new: true }
        );

        // Update booking status to completed
        booking.status = 'completed';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            booking
        });

    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};
