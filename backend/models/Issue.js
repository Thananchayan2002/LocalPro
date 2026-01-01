const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required']
    },
    issueName: {
        type: String,
        required: [true, 'Issue name is required'],
        trim: true
    },
    basicCost: {
        type: Number,
        required: [true, 'Basic cost is required'],
        min: [0, 'Basic cost cannot be negative']
    }
}, {
    timestamps: true
});

// Index for faster lookups and filtering
issueSchema.index({ serviceId: 1 });
issueSchema.index({ issueName: 1 });

module.exports = mongoose.model('Issue', issueSchema);
