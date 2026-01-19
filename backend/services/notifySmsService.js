/**
 * Notify.lk SMS Service
 * Sends SMS via Notify.lk API
 *
 * Documentation: https://docs.notify.lk/
 */

const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const NOTIFYLK_USER_ID = process.env.NOTIFYLK_USER_ID;
const NOTIFYLK_API_KEY = process.env.NOTIFYLK_API_KEY;
const NOTIFYLK_SENDER_ID = process.env.NOTIFYLK_SENDER_ID || "NotifyDEMO";
const NOTIFYLK_BASE_URL =
  process.env.NOTIFYLK_BASE_URL || "https://app.notify.lk/api/v1/send";

/**
 * Send SMS via Notify.lk
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +94771234567)
 * @param {string} message - SMS message text (max 160 chars for basic SMS)
 * @returns {Promise<Object>} - Response from Notify API
 */
async function sendSmsViaNotify(phoneNumber, message) {
  try {
    // Validate required credentials
    if (!NOTIFYLK_USER_ID || !NOTIFYLK_API_KEY) {
      throw new Error(
        "Missing Notify.lk credentials. Set NOTIFYLK_USER_ID and NOTIFYLK_API_KEY in .env",
      );
    }

    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    if (!message) {
      throw new Error("Message is required");
    }

    // Remove + from phone number if present (Notify expects format without +)
    const phone = phoneNumber.startsWith("+")
      ? phoneNumber.slice(1)
      : phoneNumber;

    console.log("[SMS] Sending OTP via Notify.lk...");
    console.log("[SMS] To:", phone);
    console.log("[SMS] Message:", message.substring(0, 50) + "...");

    // Prepare request payload
    const payload = {
      user_id: NOTIFYLK_USER_ID,
      api_key: NOTIFYLK_API_KEY,
      sender_id: NOTIFYLK_SENDER_ID,
      to: phone,
      message: message,
    };

    // Send request to Notify API
    const response = await axios.post(NOTIFYLK_BASE_URL, payload, {
      timeout: 10000, // 10 second timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[SMS] Notify.lk response:", response.status, response.data);

    // Check if request was successful
    if (response.status === 200) {
      console.log("[SMS] SMS sent successfully to", phone);
      return {
        success: true,
        messageId: response.data?.message_id,
        phone,
        message: "SMS sent successfully",
      };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error("[SMS] Error sending SMS via Notify:", error.message);

    // Log full error for debugging
    if (error.response) {
      console.error(
        "[SMS] Notify API error:",
        error.response.status,
        error.response.data,
      );
    }

    // Throw with helpful message
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Format OTP message
 * @param {string} otp - 6-digit OTP code
 * @returns {string} - Formatted message
 */
function formatOtpMessage(otp) {
  return `Your HelpGo verification code is ${otp}.
This code expires in 60 seconds. Do not share it with anyone`;
}

/**
 * Format password reset message
 * @param {string} otp - 6-digit OTP code
 * @returns {string} - Formatted message
 */
function formatPasswordResetMessage(otp) {
  return `Your HelpGo password reset code is ${otp}.
This code expires in 60 seconds. For your security, do not share this code`;
}

module.exports = {
  sendSmsViaNotify,
  formatOtpMessage,
  formatPasswordResetMessage,
};
