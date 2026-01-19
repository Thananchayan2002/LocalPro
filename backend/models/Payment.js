const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required'],
        unique: true
    },
    paymentByUser: {
        type: Number,
        default: null
    },
    paymentByWorker: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
