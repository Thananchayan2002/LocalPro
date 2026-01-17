const Professional = require('../models/Professional');
const User = require('../models/User');
const RefreshToken = require("../models/RefreshToken");
const {
    createAccessToken,
    createRefreshToken,
    hashToken,
    setAuthCookies
} = require("../utils/authTokens");

const issueProfessionalTokens = async (professional, req, res) => {
    const accessToken = createAccessToken({
        professionalId: professional._id,
        username: professional.username,
        role: "professional"
    });

    const { token: refreshToken, expiresAt } = createRefreshToken();

    await RefreshToken.create({
        subjectId: professional._id,
        subjectType: "professional",
        tokenHash: hashToken(refreshToken),
        expiresAt,
        createdByIp: req.ip
    });

    setAuthCookies(res, accessToken, refreshToken);
};

/**
 * Login controller for professionals
 * POST /api/worker/login
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Worker login attempt:', { username, hasPassword: !!password });

        // Validation
        if (!username || !password) {
            console.log('Login failed: Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find professional by username (which contains email) and populate service name
        const professional = await Professional.findOne({ username: username.trim() })
            .populate({ path: 'serviceId', select: 'service' });

        if (!professional) {
            console.log('Login failed: Professional not found for email:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('Professional found:', { username: professional.username, status: professional.status });

        // Check status - only allow login if status is 'accepted'
        if (professional.status !== 'accepted') {
            let errorMessage = '';
            
            if (professional.status === 'paused') {
                errorMessage = 'Your account has been blocked by the administrator. Please contact the administrator for more details.';
            } else if (professional.status === 'denied') {
                errorMessage = 'Your account registration has been denied. Please contact the administrator for more details.';
            } else if (professional.status === 'pending') {
                errorMessage = 'Your account is still pending approval. Please contact the administrator for more details.';
            }

            console.log('Login failed: Status not accepted:', professional.status);
            return res.status(401).json({
                success: false,
                message: errorMessage || `Your account status is ${professional.status}. Please contact the administrator for more details.`
            });
        }

        // Compare password
        const isPasswordMatch = await professional.comparePassword(password);

        if (!isPasswordMatch) {
            console.log('Login failed: Password mismatch for email:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('Login successful for email:', username);

        // Generate JWT token
        await issueProfessionalTokens(professional, req, res);

        const serviceName = professional.serviceId && professional.serviceId.service;

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: professional._id,
                username: professional.username,
                name: professional.name,
                email: professional.email,
                phone: professional.phone,
                profileImage: professional.profileImage,
                district: professional.district,
                status: professional.status,
                location: professional.location,
                serviceId: professional.serviceId?._id || professional.serviceId,
                serviceName,
                experience: professional.experience,
                rating: professional.rating,
                totalJobs: professional.totalJobs,
                way: professional.way
            }
        });
    } catch (error) {
        console.error('Worker login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

/**
 * Update password controller for professionals
 * PUT /api/worker/update-password
 */
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Support tokens issued by both worker login (professionalId) and general auth (userId + phone)
        const professionalIdFromToken =
            req.user?.professionalId || req.user?.userId || req.user?.id;
        let professional = null;

        if (professionalIdFromToken) {
            professional = await Professional.findById(professionalIdFromToken);
        }

        // Fallback: locate professional by phone present in general auth token
        if (!professional && req.user?.phone) {
            professional = await Professional.findOne({ phone: req.user.phone });
        }

        // Fallback: if only userId is present, resolve user to phone then locate professional
        if (!professional && req.user?.userId) {
            const user = await User.findById(req.user.userId).select('phone');
            if (user?.phone) {
                professional = await Professional.findOne({ phone: user.phone });
            }
        }

        console.log('Password update attempt for professional ID:', professional?._id || 'not-found');

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        // Verify current password
        const isPasswordMatch = await professional.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            console.log('Password update failed: Current password incorrect for professional:', professional.username);
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        professional.password = newPassword;
        await professional.save();

        console.log('Password updated successfully for professional:', professional.username);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password update'
        });
    }
};
