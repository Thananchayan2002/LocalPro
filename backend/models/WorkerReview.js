const mongoose = require('mongoose');

const workerReviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required'],
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required']
    },
    professionalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Professional ID is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster lookups
workerReviewSchema.index({ professionalId: 1 });
workerReviewSchema.index({ customerId: 1 });

module.exports = mongoose.model('WorkerReview', workerReviewSchema);
