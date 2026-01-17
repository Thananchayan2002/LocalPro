/**
 * Unified validation utilities for auth forms
 */

// Password requirements: 8+ chars, 1 uppercase, 1 number, 1 special char
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (!PASSWORD_REGEX.test(password))
    return "Password must contain uppercase, number, and special character (!@#$%^&*)";
  return "";
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return "Confirm password is required";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
};

export const validateName = (name) => {
  if (!name || !name.trim()) return "Full name is required";
  if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(name.trim()))
    return "Name should only contain letters and spaces";
  return "";
};

export const validateEmail = (email) => {
  if (!email) return ""; // Email is optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return "Invalid email format";
  return "";
};

export const getPasswordStrength = (password) => {
  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= PASSWORD_MIN_LENGTH) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-400", score };
  if (score === 3) return { label: "Okay", color: "bg-yellow-400", score };
  if (score === 4) return { label: "Good", color: "bg-blue-400", score };
  return { label: "Strong", color: "bg-green-500", score };
};
