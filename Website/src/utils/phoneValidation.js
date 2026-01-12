/**
 * Unified phone number validation and normalization utilities
 * All phone numbers are standardized to E.164 format (+94xxxxxxxxx for Sri Lanka)
 */

const LK_COUNTRY_CODE = "94";
const LK_DIAL = "+94";

/**
 * Convert any phone format to E.164 format
 * Handles: 077..., 0077..., +9477..., +94077..., etc.
 */
export const toE164FromAny = (input) => {
    if (!input) return null;

    let digits = String(input || "").replace(/[^\d+]/g, "");

    // Remove leading +
    if (digits.startsWith("+")) {
        digits = digits.slice(1);
    }

    // Handle country code prefix
    if (digits.startsWith(LK_COUNTRY_CODE)) {
        digits = digits.slice(LK_COUNTRY_CODE.length);
    }

    // Remove leading 0
    if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    // Must be 9 digits for Sri Lanka
    if (digits.length !== 9) return null;

    return `${LK_DIAL}${digits}`;
};

/**
 * Validate phone number for Sri Lanka (+94 only)
 * Returns error message or empty string if valid
 */
export const validatePhoneNumber = (phone, countryDial = LK_DIAL) => {
    const digits = (phone || "").replace(/[^\d]/g, "");

    // Generic bounds
    if (digits.length < 7) return "Phone number is too short.";
    if (digits.length > 12) return "Phone number is too long.";

    // LK strict check
    if (countryDial === LK_DIAL) {
        if (digits.length !== 9)
            return "Sri Lankan mobile must be 9 digits (e.g. 77XXXXXXX).";
        if (!/^7\d{8}$/.test(digits))
            return "Sri Lankan mobile must start with 7 (e.g. 77XXXXXXX).";
    }

    return "";
};

/**
 * Strip country code and leading zero from phone input
 */
export const stripCountryDialFromInput = (input, countryDial = LK_DIAL) => {
    let digits = (input || "").replace(/[^\d]/g, "");
    const countryDigits = (countryDial || "").replace("+", "");

    if (digits.startsWith(countryDigits))
        digits = digits.slice(countryDigits.length);
    if (digits.startsWith("0")) digits = digits.slice(1);

    return digits;
};

/**
 * Normalize local phone digits (remove spaces/symbols, drop leading 0)
 */
export const normalizeLocalPhone = (localRaw) => {
    let v = (localRaw || "").trim().replace(/[^\d]/g, "");
    if (v.startsWith("0")) v = v.slice(1);
    return v;
};

/**
 * Build E.164 formatted phone number from components
 */
export const buildE164Phone = (dial, localDigits) => {
    const local = (localDigits || "").replace(/[^\d]/g, "");
    return `${dial}${local}`;
};
