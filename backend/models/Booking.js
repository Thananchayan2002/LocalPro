const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required']
    },
    professionalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Will be assigned later
    },
    service: {
        type: String,
        required: [true, 'Service is required'],
        trim: true
    },
    issueType: {
        type: String,
        required: [true, 'Issue type is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['requested', 'assigned', 'inspecting', 'approved', 'inProgress', 'completed', 'cancelled', 'paid', 'verified'],
        default: 'requested'
    },
    paidAt: {
        type: Date,
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    scheduledTime: {
        type: Date,
        required: [true, 'Scheduled time is required']
    },
    duration: {
        type: Number,
        default: 2 // Duration in hours
    },
    location: {
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        area: {
            type: String,
            required: [true, 'Area is required'],
            trim: true
        },
        lat: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        lng: {
            type: Number,
            required: [true, 'Longitude is required']
        },
        address: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true
});

// Indexes for faster lookups
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ professionalId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
