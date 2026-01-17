const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

const parsePositiveNumber = (name, value, fallback) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  if (value !== undefined) {
    console.warn(
      `[authTokens] Invalid ${name} value "${value}", using default ${fallback}.`
    );
  }
  return fallback;
};

const ACCESS_TOKEN_TTL_MINUTES = parsePositiveNumber(
  "ACCESS_TOKEN_TTL_MINUTES",
  process.env.ACCESS_TOKEN_TTL_MINUTES,
  15
);
const REFRESH_TOKEN_TTL_DAYS = parsePositiveNumber(
  "REFRESH_TOKEN_TTL_DAYS",
  process.env.REFRESH_TOKEN_TTL_DAYS,
  7
);

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
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
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );
  return { token, expiresAt };
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(
    "accessToken",
    accessToken,
    cookieOptions(ACCESS_TOKEN_TTL_MINUTES * 60 * 1000)
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  );
};

const clearAuthCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
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
