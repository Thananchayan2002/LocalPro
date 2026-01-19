const mongoose = require('mongoose');

const clientReviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required'],
        unique: true
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

module.exports = mongoose.model('ClientReview', clientReviewSchema);
