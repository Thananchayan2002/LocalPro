const User = require("../models/User");
const OtpCode = require("../models/OtpCode");
const RefreshToken = require("../models/RefreshToken");
const {
    createAccessToken,
    createRefreshToken,
    hashToken,
    setAuthCookies
} = require("../utils/authTokens");
const {
    sendSmsViaNotify,
    formatOtpMessage,
} = require("../services/notifySmsService");
const { toE164FromAny } = require("../utils/phone");

/**
 * Send OTP to phone number (unified flow - no signup/login distinction)
 * POST /api/otp/send
 * Body: { phoneNumber: "+94771234567", purpose: "LOGIN" | "SIGNUP" | "UNIFIED" }
 */
exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber, purpose = "UNIFIED" } = req.body;
        const normalizedPurpose = String(purpose || "UNIFIED").toUpperCase();

        console.log(
            `[OTP SEND REQUEST] Phone: ${phoneNumber}, Purpose: ${normalizedPurpose}, Time: ${new Date().toISOString()}`
        );

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Normalize phone to E.164 format
        const phoneE164 = toE164FromAny(phoneNumber);

        if (!phoneE164) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
            });
        }

        console.log(`[OTP SEND] Normalized phone: ${phoneE164}`);

        // Rate limiting: Check if user has sent OTP in last 30 seconds
        const recentOtp = await OtpCode.findOne({
            phone: phoneE164,
            purpose: normalizedPurpose,
            used: false,
            createdAt: { $gt: new Date(Date.now() - 30 * 1000) }, // Last 30 seconds
        });

        if (recentOtp) {
            console.log(
                `[OTP RATE LIMIT] Phone ${phoneE164} - blocked (30s cooldown)`
            );
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting a new OTP",
                retryAfter: 30,
            });
        }

        // Rate limiting: Check if user has exceeded daily resend limit (10 per day per phone)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyCount = await OtpCode.countDocuments({
            phone: phoneE164,
            purpose: normalizedPurpose,
            createdAt: { $gte: today },
        });

        if (dailyCount >= 10) {
            console.log(
                `[OTP DAILY LIMIT] Phone ${phoneE164} - blocked (10/day limit reached)`
            );
            return res.status(429).json({
                success: false,
                message: "Too many OTP requests. Please try again tomorrow",
                retryAfter: 86400, // 24 hours
            });
        }

        console.log(
            `[OTP DAILY COUNT] Phone ${phoneE164} - ${dailyCount}/10 requests today`
        );

        // Single lookup; used for hints/guards below
        const existingUser = await User.findOne({
            $or: [
                { phoneNumber: phoneE164 },
                { phone: phoneE164 }
            ]
        });

        // For SIGNUP we still block already-registered numbers
        if (normalizedPurpose === "SIGNUP" && existingUser) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered",
            });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Delete any existing unused OTP for this phone+purpose
        await OtpCode.deleteMany({
            phone: phoneE164,
            purpose: normalizedPurpose,
            used: false,
        });

        // Save new OTP to database
        const otpDoc = await OtpCode.create({
            phone: phoneE164,
            code: otp,
            purpose: normalizedPurpose,
            expiresAt,
            used: false,
            attempts: 0,
            maxAttempts: 5,
        });

        try {
            // Send SMS via Notify.lk
            const smsMessage = formatOtpMessage(otp);
            console.log(
                `[OTP SMS SENDING] Phone: ${phoneE164}, OTP: ${otp}, Purpose: ${normalizedPurpose}`
            );
            await sendSmsViaNotify(phoneE164, smsMessage);
            console.log(
                `[OTP SMS SUCCESS] Phone: ${phoneE164} - OTP sent successfully`
            );
        } catch (smsError) {
            console.error(
                `[OTP SMS FAILED] Phone: ${phoneE164} - Error:`,
                smsError.message
            );
            // Delete the OTP since SMS failed
            await OtpCode.deleteOne({ _id: otpDoc._id });

            return res.status(500).json({
                success: false,
                message: "Failed to send OTP. Please try again.",
            });
        }

        console.log(
            `[OTP SEND COMPLETE] Phone: ${phoneE164} - Response sent to client`
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            expiresInSeconds: 300, // 5 minutes
            userExists: Boolean(existingUser),
            purpose: normalizedPurpose,
        });
    } catch (error) {
        console.error("[OTP SEND ERROR]", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
};

/**
 * Verify OTP (unified flow - just verify, don't login/create user)
 * POST /api/otp/verify
 * Body: { phoneNumber: "+94771234567", otp: "123456", purpose: "LOGIN" | "SIGNUP" | "UNIFIED" }
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp, purpose = "LOGIN" } = req.body;
        const normalizedPurpose = String(purpose || "LOGIN").toUpperCase();

        console.log(`[OTP VERIFY] Request received - Phone: ${phoneNumber}, OTP: ${otp}, Purpose: ${normalizedPurpose}`);

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required",
            });
        }

        // Normalize phone to E.164 format
        const phoneE164 = toE164FromAny(phoneNumber);
        if (!phoneE164) {
            console.log(`[OTP VERIFY] Invalid phone format: ${phoneNumber}`);
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
            });
        }

        console.log(`[OTP VERIFY] Normalized phone: ${phoneE164}`);

        const now = new Date();

        // Find valid, unused OTP
        console.log(`[OTP VERIFY] Searching for OTP in database...`);
        const otpDoc = await OtpCode.findOne({
            phone: phoneE164,
            code: String(otp),
            purpose: normalizedPurpose,
            used: false,
            expiresAt: { $gt: now },
        });

        if (!otpDoc) {
            console.log(`[OTP VERIFY] No valid OTP found, checking for expired/used OTP...`);
            // Check if OTP exists but is expired or already used
            const expiredOtp = await OtpCode.findOne({
                phone: phoneE164,
                code: String(otp),
                purpose: normalizedPurpose,
            });

            if (expiredOtp && expiredOtp.used) {
                console.log(`[OTP VERIFY] OTP already used`);
                return res.status(400).json({
                    success: false,
                    message: "OTP already used",
                });
            }

            if (expiredOtp && expiredOtp.expiresAt <= now) {
                console.log(`[OTP VERIFY] OTP expired`);
                return res.status(400).json({
                    success: false,
                    message: "OTP expired. Please request a new one.",
                });
            }

            console.log(`[OTP VERIFY] Invalid OTP`);
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        console.log(`[OTP VERIFY] Valid OTP found, marking as used...`);
        // Mark OTP as used
        otpDoc.used = true;
        otpDoc.attempts = (otpDoc.attempts || 0) + 1;
        await otpDoc.save();

        // Single lookup for routing decisions
        console.log(`[OTP VERIFY] Looking up user by phone: ${phoneE164}`);
        let user = null;
        try {
            user = await User.findOne({
                $or: [
                    { phoneNumber: phoneE164 },
                    { phone: phoneE164 }
                ]
            });
            console.log(`[OTP VERIFY] User lookup result: ${user ? 'Found' : 'Not found'}`);
        } catch (userError) {
            console.error(`[OTP VERIFY] Error looking up user:`, userError);
            // Continue without user - treat as new signup
        }

        // Update lastLogin for existing users on successful verification
        if (user && user.status === "active") {
            try {
                user.lastLogin = new Date();
                await user.save();
                console.log(`[OTP VERIFY] Updated lastLogin for user`);
            } catch (saveError) {
                console.error(`[OTP VERIFY] Error updating lastLogin:`, saveError);
                // Continue - this is not critical
            }
        }

        // For LOGIN purpose (default)
        if (normalizedPurpose === "LOGIN") {
            if (!user) {
                console.log(`[OTP VERIFY] No user found, returning userExists: false`);
                return res.status(200).json({
                    success: true,
                    message: "Phone verified. No account found; proceed to signup.",
                    phoneNumber: phoneE164,
                    userExists: false,
                });
            }

            if (user.status === "blocked") {
                console.log(`[OTP VERIFY] User is blocked`);
                return res.status(403).json({
                    success: false,
                    message: "Account is blocked. Please contact administrator.",
                });
            }

            if (user.status !== "active") {
                console.log(`[OTP VERIFY] User status is ${user.status}`);
                return res.status(403).json({
                    success: false,
                    message: `Account is ${user.status}. Please contact support.`,
                });
            }

            const accessToken = createAccessToken({
                userId: user._id,
                phoneNumber: user.phoneNumber || user.phone,
                email: user.email,
                role: user.role,
            });
            const { token: refreshToken, expiresAt } = createRefreshToken();

            await RefreshToken.create({
                subjectId: user._id,
                subjectType: "user",
                tokenHash: hashToken(refreshToken),
                expiresAt,
                createdByIp: req.ip,
            });

            setAuthCookies(res, accessToken, refreshToken);

            console.log(`[OTP VERIFY] Login successful for user ${user._id}`);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber || user.phone,
                    role: user.role,
                    location: user.location,
                    status: user.status,
                    lastLogin: user.lastLogin,
                },
                userExists: true,
            });
        }

        if (normalizedPurpose === "SIGNUP") {
            if (user) {
                console.log(`[OTP VERIFY] User already exists for SIGNUP purpose`);
                return res.status(409).json({
                    success: false,
                    message: "Phone number already registered",
                });
            }

            console.log(`[OTP VERIFY] Phone verified for SIGNUP`);
            return res.status(200).json({
                success: true,
                message: "Phone number verified successfully",
                phoneNumber: phoneE164,
                userExists: false,
            });
        }

        if (normalizedPurpose === "UNIFIED") {
            console.log(`[OTP VERIFY] UNIFIED purpose, returning userExists: ${Boolean(user)}`);
            return res.status(200).json({
                success: true,
                message: "OTP verified successfully",
                phoneNumber: phoneE164,
                userExists: Boolean(user),
            });
        }

        console.log(`[OTP VERIFY] Invalid purpose: ${normalizedPurpose}`);
        return res.status(400).json({
            success: false,
            message: "Invalid purpose",
        });
    } catch (error) {
        console.error("[OTP VERIFY ERROR] Unhandled exception:", error);
        console.error("[OTP VERIFY ERROR] Stack trace:", error.stack);
        return res.status(500).json({
            success: false,
            message: "Verification failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
