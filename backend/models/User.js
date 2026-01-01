const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['customer', 'professional', 'admin'],
        required: true,
        default: 'customer'
    },
    location: {
        type: String,
        trim: true
    },
    lastLogin: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'pending', 'pause'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for faster email lookups
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
