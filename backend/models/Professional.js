const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const professionalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                if (!v) return true; // Email is optional
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required']
    },
    experience: {
        type: Number,
        required: [true, 'Experience is required'],
        min: [0, 'Experience cannot be negative']
    },
    rating: {
        type: Number,
        default: 4,
        min: [0, 'Rating must be between 0 and 5'],
        max: [5, 'Rating must be between 0 and 5']
    },
    totalJobs: {
        type: Number,
        default: 0,
        min: [0, 'Total jobs cannot be negative']
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        enum: [
            'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
            'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
            'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
            'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
            'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
        ]
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    lat: {
        type: Number,
        default: null
    },
    lng: {
        type: Number,
        default: null
    },
    nicNumber: {
        type: String,
        required: [true, 'NIC number is required'],
        unique: true,
        trim: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        sparse: true // Allows null values to be non-unique
    },
    password: {
        type: String
    },
    way: {
        type: String,
        required: [true, 'Registration way is required'],
        enum: ['manual', 'website']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'paused', 'denied'],
        default: 'pending'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster lookups
professionalSchema.index({ status: 1, way: 1 });
professionalSchema.index({ district: 1 });
professionalSchema.index({ name: 'text' }); // Text index for search

// Hash password before saving
professionalSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
professionalSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Professional', professionalSchema);
