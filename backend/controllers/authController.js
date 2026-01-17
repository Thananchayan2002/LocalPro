const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Professional = require("../models/Professional");
const RefreshToken = require("../models/RefreshToken");
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
} = require("../utils/authTokens");

const isAdmin = (req) => req.user?.role === "admin";
const isSelfById = (req, userId) =>
  Boolean(req.user?.userId) && String(req.user.userId) === String(userId);

const buildUserTokenPayload = (user) => ({
  userId: user._id,
  phone: user.phone,
  phoneNumber: user.phoneNumber || user.phone,
  email: user.email,
  role: user.role,
});

const sanitizeUser = (user, professionalId = null) => ({
  id: user._id,
  professionalId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  phoneNumber: user.phoneNumber || user.phone,
  role: user.role,
  location: user.location,
  status: user.status,
  lastLogin: user.lastLogin,
});

const issueUserTokens = async (user, req, res) => {
  const accessToken = createAccessToken(buildUserTokenPayload(user));
  const { token: refreshToken, expiresAt } = createRefreshToken();

  await RefreshToken.create({
    subjectId: user._id,
    subjectType: "user",
    tokenHash: hashToken(refreshToken),
    expiresAt,
    createdByIp: req.ip,
  });

  setAuthCookies(res, accessToken, refreshToken);
};

// Register controller (customer signup)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      location: location || "",
      passwordHash,
      role: "customer",
      status: "active",
    });

    await issueUserTokens(user, req, res);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
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
        message: "Please provide phone and password",
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    // Check user status
    if (user.status === "blocked") {
      const contact = process.env.SUPPORT_PHONE || "your administrator";
      return res.status(403).json({
        success: false,
        code: "blocked",
        message: `Account is blocked. Please contact administrator at ${contact}.`,
      });
    }

    if (user.status === "pause" && user.role === "customer") {
      return res.status(403).json({
        success: false,
        code: "paused",
        message: "Your account is paused. Please contact support.",
      });
    }

    if (
      user.status !== "active" &&
      !(user.status === "pause" && user.role !== "customer")
    ) {
      return res.status(403).json({
        success: false,
        code: "inactive",
        message: `Account is ${user.status}. Please contact support.`,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // For professionals, fetch professional ID
    let professionalId = null;
    if (user.role === "professional") {
      const professional = await Professional.findOne({ phone: user.phone });
      if (professional) {
        professionalId = professional._id;
      }
    }

    // Generate JWT token
    await issueUserTokens(user, req, res);

    // Return user data (excluding password hash)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user, professionalId),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Logout controller (optional - mainly for clearing server-side sessions if needed)
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.updateOne(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedByIp: req.ip } }
      );
    }

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update phone - verifies current phone and password before updating
exports.updatePhone = async (req, res) => {
  try {
    let { currentPhone, newPhone, password } = req.body;

    currentPhone = (currentPhone || "").trim();
    newPhone = (newPhone || "").trim();
    password = (password || "").toString();

    if (!currentPhone || !newPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide current phone, new phone and password",
      });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Debug log to help track mismatches
    console.log(
      `updatePhone requested: user.phone=${user.phone}, currentPhone=${currentPhone}`
    );

    if ((user.phone || "").trim() !== currentPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Current phone is incorrect" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    // Ensure new phone isn't already taken by another user
    const existing = await User.findOne({ phone: newPhone });
    if (existing && existing._id.toString() !== user._id.toString()) {
      return res
        .status(409)
        .json({ success: false, message: "Phone already in use" });
    }

    user.phone = newPhone;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone updated successfully",
      user: { id: user._id, phone: user.phone },
    });
  } catch (error) {
    console.error("Update phone error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Keep updateEmail for backward compatibility (deprecated)
exports.updateEmail = exports.updatePhone;

// Verify credentials - used to check current phone + password before allowing updates
exports.verifyCredentials = async (req, res) => {
  try {
    let { phone, password } = req.body;
    phone = (phone || "").trim();
    password = (password || "").toString();

    if (!phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide phone and password" });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Debug log to help track mismatches
    console.log(
      `verifyCredentials requested: user.phone=${user.phone}, provided=${phone}`
    );

    if ((user.phone || "").trim() !== phone) {
      return res.status(400).json({
        success: false,
        message: "Phone does not match current account",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    res.status(200).json({
      success: true,
      message: "Credentials verified",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Verify credentials error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Update password - verifies current password before updating
exports.updatePassword = async (req, res) => {
  try {
    const { currentPhone, currentPassword, newPassword } = req.body;

    if (!currentPhone || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide current phone, current password and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if ((user.phone || "").trim() !== (currentPhone || "").trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Current phone is incorrect" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isAdmin(req) && !isSelfById(req, id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this user.",
      });
    }

    const user = await User.findById(id).select(
      "name email phone location role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get user by phone number
exports.getUserByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!isAdmin(req)) {
      const requester = await User.findById(req.user?.userId).select(
        "name email phone location role phoneNumber"
      );

      if (!requester) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const matches =
        requester.phone === phone || requester.phoneNumber === phone;

      if (!matches) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this user.",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          name: requester.name,
          email: requester.email,
          phone: requester.phone,
          location: requester.location,
          role: requester.role,
        },
      });
    }

    const user = await User.findOne({ phone }).select(
      "name email phone location role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by phone error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Check if user exists by phone number (for new unified flow)
exports.checkUserByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate phone number format (E.164)
    if (!/^\+\d{7,15}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this phone number, you can proceed to login.",
    });
  } catch (error) {
    console.error("Check user by phone error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Login with phone (after OTP verification)
exports.loginWithPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate phone number format (E.164)
    if (!/^\+\d{7,15}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Find user by phone number
    const user = await User.findOne({
      $or: [{ phoneNumber }, { phone: phoneNumber }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Check user status
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        code: "blocked",
        message: "Account is blocked. Please contact administrator.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "inactive",
        message: `Account is ${user.status}. Please contact support.`,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // For professionals, fetch professional ID
    let professionalId = null;
    if (user.role === "professional") {
      const professional = await Professional.findOne({
        $or: [{ phone: user.phone }, { phone: user.phoneNumber }],
      });
      if (professional) {
        professionalId = professional._id;
      }
    }

    // Generate JWT token
    await issueUserTokens(user, req, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user, professionalId),
    });
  } catch (error) {
    console.error("Login with phone error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Complete profile and create user (after OTP verification)
exports.completeProfile = async (req, res) => {
  try {
    const { name, email, location, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and phone number",
      });
    }

    // Validate phone number format (E.164)
    if (!/^\+\d{7,15}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { phone: phoneNumber }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // If email is provided, check if it's unique
    let normalizedEmail;
    if (email) {
      normalizedEmail = email.toLowerCase();
      const emailExists = await User.findOne({ email: normalizedEmail });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Create user (passwordless - using OTP authentication)
    const user = await User.create({
      name,
      phoneNumber,
      phone: phoneNumber, // Legacy field for compatibility
      email: normalizedEmail,
      location: location || "",
      role: "customer",
      status: "active",
    });

    // Generate JWT token
    await issueUserTokens(user, req, res);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Complete profile error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({
        success: false,
        message: `${field} already in use`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Refresh access token using refresh token cookie
exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or expired",
      });
    }

    let subject = null;
    if (stored.subjectType === "professional") {
      subject = await Professional.findById(stored.subjectId);
    } else {
      subject = await User.findById(stored.subjectId);
    }

    if (!subject) {
      clearAuthCookies(res);
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (subject.status && subject.status !== "active") {
      await RefreshToken.updateOne(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date(), revokedByIp: req.ip } }
      );
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: `Account is ${subject.status}. Please contact support.`,
      });
    }

    const payload =
      stored.subjectType === "professional"
        ? {
            professionalId: subject._id,
            username: subject.username,
            role: "professional",
          }
        : buildUserTokenPayload(subject);

    const accessToken = createAccessToken(payload);
    const { token: newRefreshToken, expiresAt } = createRefreshToken();
    const newHash = hashToken(newRefreshToken);

    await RefreshToken.updateOne(
      { tokenHash, revokedAt: null },
      {
        $set: {
          revokedAt: new Date(),
          revokedByIp: req.ip,
          replacedByTokenHash: newHash,
        },
      }
    );

    await RefreshToken.create({
      subjectId: stored.subjectId,
      subjectType: stored.subjectType,
      tokenHash: newHash,
      expiresAt,
      createdByIp: req.ip,
    });

    setAuthCookies(res, accessToken, newRefreshToken);

    const userPayload =
      stored.subjectType === "professional"
        ? {
            id: subject._id,
            name: subject.name,
            email: subject.email,
            phone: subject.phone,
            role: "professional",
            status: subject.status,
          }
        : sanitizeUser(subject);

    return res.status(200).json({
      success: true,
      user: userPayload,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Return current session user
exports.me = async (req, res) => {
  try {
    if (req.user?.professionalId) {
      const professional = await Professional.findById(req.user.professionalId);
      if (!professional) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: professional._id,
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          role: "professional",
          status: professional.status,
        },
      });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
