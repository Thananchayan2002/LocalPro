const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

const parsePositiveNumber = (name, value, fallback) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  if (value !== undefined) {
    console.warn(
      `[authTokens] Invalid ${name} value "${value}", using default ${fallback}.`,
    );
  }
  return fallback;
};

const ACCESS_TOKEN_TTL_MINUTES = parsePositiveNumber(
  "ACCESS_TOKEN_TTL_MINUTES",
  process.env.ACCESS_TOKEN_TTL_MINUTES,
  15, 
);
const REFRESH_TOKEN_TTL_DAYS = parsePositiveNumber(
  "REFRESH_TOKEN_TTL_DAYS",
  process.env.REFRESH_TOKEN_TTL_DAYS,
  7,
);

const isProduction = process.env.NODE_ENV === "production";

const normalizeSameSite = (value, fallback) => {
  const normalized = String(value || "").toLowerCase();
  if (["strict", "lax", "none"].includes(normalized)) return normalized;
  return fallback;
};

const cookieSameSite = normalizeSameSite(
  process.env.COOKIE_SAMESITE,
  isProduction ? "none" : "lax",
);
const cookieSecure =
  process.env.COOKIE_SECURE !== undefined
    ? String(process.env.COOKIE_SECURE).toLowerCase() === "true"
    : isProduction || cookieSameSite === "none";

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: cookieSecure,
  sameSite: cookieSameSite,
  maxAge: maxAgeMs,
  path: "/",
});

const createAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${ACCESS_TOKEN_TTL_MINUTES}m`,
  });

const createRefreshToken = () => {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  return { token, expiresAt };
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const setAuthCookies = (res, accessToken, refreshToken) => {
  const accessMaxAgeMs = ACCESS_TOKEN_TTL_MINUTES * 60 * 1000;
  const refreshMaxAgeMs = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

  res.cookie(
    "accessToken",
    accessToken,
    cookieOptions(accessMaxAgeMs),
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(refreshMaxAgeMs),
  );
};

const clearAuthCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: "/",
  };
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

module.exports = {
  ACCESS_TOKEN_TTL_MINUTES,
  REFRESH_TOKEN_TTL_DAYS,
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
};
