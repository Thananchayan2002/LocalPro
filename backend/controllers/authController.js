const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Professional = require('../models/Professional');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register controller (customer signup)
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, location } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, phone and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already in use'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: normalizedEmail,
            phone,
            location: location || '',
            passwordHash,
            role: 'customer',
            status: 'active'
        });

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                location: user.location,
                status: user.status,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validate input
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone and password'
            });
        }

        // Find user by phone
        const user = await User.findOne({ phone: phone.trim() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone or password'
            });
        }

        // Check user status
        if (user.status === 'blocked') {
            const contact = process.env.SUPPORT_PHONE || 'your administrator';
            return res.status(403).json({
                success: false,
                code: 'blocked',
                message: `Account is blocked. Please contact administrator at ${contact}.`
            });
        }

        if (user.status === 'pause' && user.role === 'customer') {
            return res.status(403).json({
                success: false,
                code: 'paused',
                message: 'Your account is paused. Please contact support.'
            });
        }

        if (user.status !== 'active' && !(user.status === 'pause' && user.role !== 'customer')) {
            return res.status(403).json({
                success: false,
                code: 'inactive',
                message: `Account is ${user.status}. Please contact support.`
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // For professionals, fetch professional ID
        let professionalId = null;
        if (user.role === 'professional') {
            const professional = await Professional.findOne({ phone: user.phone });
            if (professional) {
                professionalId = professional._id;
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                phone: user.phone,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Return user data (excluding password hash)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                professionalId: professionalId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                location: user.location,
                status: user.status,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Logout controller (optional - mainly for clearing server-side sessions if needed)
exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update phone - verifies current phone and password before updating
exports.updatePhone = async (req, res) => {
    try {
        let { currentPhone, newPhone, password } = req.body;

        currentPhone = (currentPhone || '').trim();
        newPhone = (newPhone || '').trim();
        password = (password || '').toString();

        if (!currentPhone || !newPhone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide current phone, new phone and password' });
        }

        // Verify token and get user
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No authorization token provided' });
        }

        const token = authHeader.split(' ')[1];
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Debug log to help track mismatches
        console.log(`updatePhone requested: user.phone=${user.phone}, currentPhone=${currentPhone}`);

        if ((user.phone || '').trim() !== currentPhone) {
            return res.status(400).json({ success: false, message: 'Current phone is incorrect' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Ensure new phone isn't already taken by another user
        const existing = await User.findOne({ phone: newPhone });
        if (existing && existing._id.toString() !== user._id.toString()) {
            return res.status(409).json({ success: false, message: 'Phone already in use' });
        }

        user.phone = newPhone;
        await user.save();

        res.status(200).json({ success: true, message: 'Phone updated successfully', user: { id: user._id, phone: user.phone } });
    } catch (error) {
        console.error('Update phone error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// Keep updateEmail for backward compatibility (deprecated)
exports.updateEmail = exports.updatePhone;

// Verify credentials - used to check current phone + password before allowing updates
exports.verifyCredentials = async (req, res) => {
    try {
        let { phone, password } = req.body;
        phone = (phone || '').trim();
        password = (password || '').toString();

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Please provide phone and password' });
        }

        // Verify token and get user
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No authorization token provided' });
        }

        const token = authHeader.split(' ')[1];
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Debug log to help track mismatches
        console.log(`verifyCredentials requested: user.phone=${user.phone}, provided=${phone}`);

        if ((user.phone || '').trim() !== phone) {
            return res.status(400).json({ success: false, message: 'Phone does not match current account' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        res.status(200).json({ success: true, message: 'Credentials verified', phone: user.phone });
    } catch (error) {
        console.error('Verify credentials error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// Update password - verifies current password before updating
exports.updatePassword = async (req, res) => {
    try {
        const { currentPhone, currentPassword, newPassword } = req.body;

        if (!currentPhone || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current phone, current password and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        // Verify token and get user
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No authorization token provided' });
        }

        const token = authHeader.split(' ')[1];
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if ((user.phone || '').trim() !== (currentPhone || '').trim()) {
            return res.status(400).json({ success: false, message: 'Current phone is incorrect' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash and set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};
