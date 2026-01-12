const Professional = require('../models/Professional');
const Service = require('../models/Service');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateProfessionalPDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// Ensure a matching User account exists for a professional by phone/password (supports passwordless accounts for SMS OTP flow)
const ensureUserAccount = async ({ name, email, phone, password }) => {
    if (!phone ) {
        return { error: 'Phone is required to create the linked user account' };
    }

    // Check if user already exists by phone 
    const existingByPhone = await User.findOne({ phone });
    if (existingByPhone) {
        return { user: existingByPhone, created: false };
    }

    // Check if email already exists (if email is provided)
    if (email) {
        const existingByEmail = await User.findOne({ email });
        if (existingByEmail) {
            return { error: 'A user with this email already exists' };
        }
    }

    let passwordHash;
    if (password) {
        passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.create({
        name: name || 'Professional User',
        email: email || `${phone}@localpro.system`,
        phone,
        passwordHash: passwordHash || undefined,
        role: 'professional',
        lastLogin: new Date()
    });

    return { user, created: true };
};

// Get all professionals with filters
exports.getAllProfessionals = async (req, res) => {
    try {
        const { status, district, way, search, page = 1, limit = 100 } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (district) filter.district = district;
        if (way) filter.way = way;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch professionals with service details
        const professionals = await Professional.find(filter)
            .populate('serviceId', 'service description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Professional.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: professionals,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (error) {
        console.error('Get professionals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch professionals',
            error: error.message
        });
    }
};

// Get single professional by ID
exports.getProfessionalById = async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.id)
            .populate('serviceId', 'service description');

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        res.status(200).json({
            success: true,
            data: professional
        });
    } catch (error) {
        console.error('Get professional error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch professional',
            error: error.message
        });
    }
};

// Create new professional (Manual registration)
exports.createProfessional = async (req, res) => {
    try {
        const {
            name, email, phone, serviceId, experience,
            district, location, nicNumber, lat, lng, password, way
        } = req.body;

        // Check if NIC already exists
        const existingNIC = await Professional.findOne({ nicNumber });
        if (existingNIC) {
            return res.status(400).json({
                success: false,
                message: 'A professional with this NIC number already exists'
            });  
        }

        // Check if phone already exists
        const existingPhone = await Professional.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ 
                success: false, 
                message: 'A professional with this phone number already exists' 
            });
        }

        // Verify service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Ensure linked user account exists (phone/password must be provided)
        const userResult = await ensureUserAccount({ name, email, phone, password });

        if (userResult?.error) {
            return res.status(400).json({
                success: false,
                message: userResult.error
            });
        }

        // Parse coordinates (if provided) and create professional object
        let parsedLat = null;
        let parsedLng = null;
        if (lat !== undefined && lat !== null && lat !== '' && !isNaN(parseFloat(lat))) parsedLat = parseFloat(lat);
        if (lng !== undefined && lng !== null && lng !== '' && !isNaN(parseFloat(lng))) parsedLng = parseFloat(lng);

        const professionalData = {
            name,
            email: email || undefined,
            phone,
            serviceId,
            experience,
            rating: 4, // Default rating
            totalJobs: 0, // Default total jobs
            district,
            location,
            lat: parsedLat,
            lng: parsedLng,
            nicNumber,
            username: phone, // Use phone as username
            way: way || 'manual',
            status: way === 'website' ? 'pending' : 'accepted',
            profileImage: req.file ? `uploads/professionals/${req.file.filename}` : ''
        };

        const professional = await Professional.create(professionalData);

        // Populate service details
        await professional.populate('serviceId', 'service description');

        res.status(201).json({
            success: true,
            message: 'Professional created successfully',
            data: professional
        });
    } catch (error) {
        console.error('Create professional error:', error);

        // Delete uploaded file if error occurs
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'uploads', 'professionals', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create professional',
            error: error.message
        });
    }
};

// Update professional
exports.updateProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updateData.password; // Password should be updated separately
        delete updateData.totalJobs; // Managed by system
        delete updateData.rating; // Managed by system

        // If new image uploaded, update path
        if (req.file) {
            updateData.profileImage = `uploads/professionals/${req.file.filename}`;

            // Delete old image if exists
            const oldProfessional = await Professional.findById(id);
            if (oldProfessional && oldProfessional.profileImage) {
                const oldImagePath = path.join(__dirname, '..', oldProfessional.profileImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Parse coordinates if provided (handle strings from multipart/form-data)
        if ('lat' in updateData) {
            const parsedLat = updateData.lat !== undefined && updateData.lat !== null && updateData.lat !== '' && !isNaN(parseFloat(updateData.lat))
                ? parseFloat(updateData.lat)
                : null;
            updateData.lat = parsedLat;
        }
        if ('lng' in updateData) {
            const parsedLng = updateData.lng !== undefined && updateData.lng !== null && updateData.lng !== '' && !isNaN(parseFloat(updateData.lng))
                ? parseFloat(updateData.lng)
                : null;
            updateData.lng = parsedLng;
        }

        const professional = await Professional.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('serviceId', 'service description');

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Professional updated successfully',
            data: professional
        });
    } catch (error) {
        console.error('Update professional error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update professional',
            error: error.message
        });
    }
};

// Update professional status
exports.updateProfessionalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'accepted', 'paused', 'denied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const professional = await Professional.findById(id);

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        // Map professional status to user status
        let userStatus;
        if (status === 'accepted') {
            userStatus = 'active';
        } else if (status === 'paused') {
            userStatus = 'pause';
        }

        // Update linked user status if applicable
        if (userStatus) {
            await User.findOneAndUpdate(
                { phone: professional.phone },
                { status: userStatus },
                { new: true }
            );
        }

        // Update professional status
        professional.status = status;
        await professional.save();

        await professional.populate('serviceId', 'service description');


        res.status(200).json({
            success: true,
            message: `Professional status updated to ${status}`,
            data: professional
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

// Approve pending professional
exports.approveProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...otherUpdates } = req.body;

        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        // Check if phone already exists for another professional
        const finalPhone = otherUpdates.phone || professional.phone;
        const existingPhone = await Professional.findOne({
            phone: finalPhone,
            _id: { $ne: id }
        });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'A professional with this phone number already exists'
            });
        }

        // Update user account with password, role, and status
        const finalName = otherUpdates.name || professional.name;
        const finalEmail = otherUpdates.email || professional.email;
        
        // Find user by phone
        let user = await User.findOne({ phone: finalPhone });
        
        if (user) {
            // Update existing user; only set password if provided
            if (password) {
                const passwordHash = await bcrypt.hash(password, 10);
                user.passwordHash = passwordHash;
            }
            user.role = 'professional';
            user.name = finalName;
            user.email = finalEmail || user.email;
            user.lastLogin = new Date();
            await user.save();
        } else {
            // Create new user if not exists (password may be omitted for SMS OTP flow)
            const userResult = await ensureUserAccount({ 
                name: finalName, 
                email: finalEmail, 
                phone: finalPhone, 
                password 
            });

            if (userResult?.error) {
                return res.status(400).json({
                    success: false,
                    message: userResult.error
                });
            }
        }

        const updateData = {
            ...otherUpdates,
            username: finalPhone, // Use phone as username
            status: 'accepted'
        };
        if (password) updateData.password = password;

        const updatedProfessional = await Professional.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('serviceId', 'service description');

        res.status(200).json({
            success: true,
            message: 'Professional approved successfully',
            data: updatedProfessional
        });
    } catch (error) {
        console.error('Approve professional error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve professional',
            error: error.message
        });
    }
};

// Generate PDF for professional
exports.generatePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const { plainPassword } = req.body; // Plain password passed from frontend

        const professional = await Professional.findById(id)
            .populate('serviceId', 'service description');

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        // Add plain password to professional object for PDF (not saved to DB)
        const professionalData = professional.toObject();
        if (plainPassword) {
            professionalData.plainPassword = plainPassword;
        }

        // Generate PDF
        const pdfDir = path.join(__dirname, '..', 'uploads', 'pdfs');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const fileName = `professional-${professional._id}-${Date.now()}.pdf`;
        const filePath = path.join(pdfDir, fileName);

        await generateProfessionalPDF(professionalData, filePath);

        // Send file
        res.download(filePath, `${professional.name.replace(/\s+/g, '_')}_Profile.pdf`, (err) => {
            // Delete file after sending
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            if (err) {
                console.error('PDF download error:', err);
                res.status(500).json({
                    success: false,
                    message: 'Failed to download PDF'
                });
            }
        });
    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: error.message
        });
    }
};

// Delete professional
exports.deleteProfessional = async (req, res) => {
    try {
        const { id } = req.params;

        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                success: false,
                message: 'Professional not found'
            });
        }

        // Delete profile image if exists
        if (professional.profileImage) {
            const imagePath = path.join(__dirname, '..', professional.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Professional.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Professional deleted successfully'
        });
    } catch (error) {
        console.error('Delete professional error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete professional',
            error: error.message
        });
    }
};
