const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Professional = require("../models/Professional");
const dotenv = require("dotenv");
dotenv.config();
// Helper function to get JWT_SECRET with validation
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

// Password validation: 8+ chars, 1 uppercase, 1 number, 1 special char
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (!PASSWORD_REGEX.test(password))
    return "Password must contain uppercase letter, number, and special character (!@#$%^&*)";
  return "";
};

// Register controller - EMAIL/PASSWORD based (legacy - for secondary login)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone and password",
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Enforce uniqueness for both email and phone number
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phoneNumber: phone },
        { phone }, // legacy field
      ],
    });

    if (existingUser) {
      const isEmailClash = existingUser.email === normalizedEmail;
      return res.status(409).json({
        success: false,
        message: isEmailClash
          ? "Email already in use"
          : "Phone number already in use",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      phoneNumber: phone, // Also set phoneNumber for consistency
      location: location || "",
      passwordHash,
      role: "customer",
      status: "active",
    });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

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

// Register with Phone Number (PRIMARY method - after OTP verification)
exports.registerPhone = async (req, res) => {
  try {
    const { name, phoneNumber, password, email, location } = req.body;

    if (!name || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, phone number and password",
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
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
    const existingUser = await User.findOne({ phoneNumber });
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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      phoneNumber,
      phone: phoneNumber, // Legacy field for compatibility
      email: normalizedEmail,
      location: location || "",
      passwordHash,
      role: "customer",
      status: "active",
    });

    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Register phone error:", error);

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

// Login with Email/Password (SECONDARY method)
exports.loginEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        professionalId: professionalId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Login controller - PHONE based (legacy endpoint - kept for backward compatibility)
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
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Return user data (excluding password hash)
    res.status(200).json({
      success: true,
      message: "Login successful",
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
        lastLogin: user.lastLogin,
      },
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

    // Verify token and get user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, getJWTSecret());
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(payload.userId);
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

    // Verify token and get user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, getJWTSecret());
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(payload.userId);
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

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // Verify token and get user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, getJWTSecret());
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(payload.userId);
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

    // Check if user exists
    const user = await User.findOne({ phoneNumber });

    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: "User found",
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "User not found, signup required",
      });
    }
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
    const user = await User.findOne({ phoneNumber });

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
    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        professionalId: professionalId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location,
        status: user.status,
        lastLogin: user.lastLogin,
      },
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
    const existingUser = await User.findOne({ phoneNumber });
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
    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location,
        status: user.status,
        lastLogin: user.lastLogin,
      },
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

// Get current user's profile (authenticated)
exports.getMyProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware from JWT token
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-passwordHash -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        phone: user.phone,
        location: user.location,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
