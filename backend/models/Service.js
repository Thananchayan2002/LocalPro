const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    service: {
        type: String,
        required: [true, 'Service name is required'],
        unique: true,
        trim: true
    },
    iconName: {
        type: String,
        required: [true, 'Icon name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    }
}, {
    timestamps: true 
});

// Cascade delete: Remove all issues when service is deleted
serviceSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const Issue = mongoose.model('Issue');
        await Issue.deleteMany({ serviceId: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Service', serviceSchema);
