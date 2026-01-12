/**
 * Phone number utility functions
 * Handles normalization and validation for international phone numbers
 */

/**
 * Convert any phone format to E.164 format
 * E.164 format: +<country code><number> (e.g., +94771234567)
 *
 * @param {string} phone - Phone number in any format
 * @returns {string|null} - E.164 formatted phone or null if invalid
 */
function toE164FromAny(phone) {
    if (!phone) return null;

    // Remove all non-digit characters except leading +
    let normalized = phone.toString().trim();

    // If it doesn't start with +, try to add it
    if (!normalized.startsWith("+")) {
        // Remove leading 0 if present
        if (normalized.startsWith("0")) {
            normalized = normalized.slice(1);
        }

        // Try to detect country code
        // Sri Lanka: 94
        if (normalized.startsWith("94") && normalized.length === 11) {
            normalized = "+" + normalized;
        }
        // India: 91
        else if (normalized.startsWith("91") && normalized.length === 12) {
            normalized = "+" + normalized;
        }
        // US: 1
        else if (normalized.startsWith("1") && normalized.length === 10) {
            normalized = "+" + normalized;
        }
        // Default: assume Sri Lanka if 9 digits
        else if (/^\d{9}$/.test(normalized)) {
            normalized = "+94" + normalized;
        }
        // 10-11 digits starting with 7-9: likely Sri Lanka
        else if (/^[7-9]\d{8,10}$/.test(normalized)) {
            normalized = "+94" + normalized;
        }
        // Otherwise invalid
        else {
            return null;
        }
    }

    // Validate E.164 format
    const e164Pattern = /^\+\d{1,3}\d{4,14}$/;
    if (!e164Pattern.test(normalized)) {
        return null;
    }

    return normalized;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @param {string} format - Expected format: 'e164', 'local', etc.
 * @returns {boolean}
 */
function isValidPhone(phone, format = "e164") {
    if (!phone) return false;

    if (format === "e164") {
        const e164Pattern = /^\+\d{1,3}\d{4,14}$/;
        return e164Pattern.test(phone);
    }

    return false;
}

/**
 * Extract country code from E.164 phone number
 * @param {string} phone - Phone in E.164 format
 * @returns {string|null} - Country code (e.g., '94' for Sri Lanka)
 */
function getCountryCode(phone) {
    if (!isValidPhone(phone, "e164")) return null;

    // Match pattern: +<country code><rest>
    // Country codes are 1-3 digits
    const match = phone.match(/^\+(\d{1,3})/);
    return match ? match[1] : null;
}

/**
 * Extract local number (without country code)
 * @param {string} phone - Phone in E.164 format
 * @returns {string|null} - Local number
 */
function getLocalNumber(phone) {
    if (!isValidPhone(phone, "e164")) return null;

    // Remove + and country code (1-3 digits)
    const match = phone.match(/^\+\d{1,3}(.+)$/);
    return match ? match[1] : null;
}

/**
 * Format E.164 for display
 * @param {string} phone - Phone in E.164 format
 * @returns {string} - Formatted phone (e.g., "+94 771 234 567")
 */
function formatPhoneForDisplay(phone) {
    if (!isValidPhone(phone, "e164")) return phone;

    // Extract country code and local number
    const countryCode = getCountryCode(phone);
    const localNumber = getLocalNumber(phone);

    if (!countryCode || !localNumber) return phone;

    // Format based on country
    if (countryCode === "94") {
        // Sri Lanka: +94 77 123 4567
        if (localNumber.length === 9) {
            return `+${countryCode} ${localNumber.slice(0, 2)} ${localNumber.slice(
                2,
                5
            )} ${localNumber.slice(5)}`;
        }
    }

    // Default formatting
    return `+${countryCode} ${localNumber}`;
}

module.exports = {
    toE164FromAny,
    isValidPhone,
    getCountryCode,
    getLocalNumber,
    formatPhoneForDisplay,
};
