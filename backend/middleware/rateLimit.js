const buckets = new Map();

const getClientKey = (req, keyPrefix) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    (typeof forwardedFor === "string" && forwardedFor.split(",")[0].trim()) ||
    req.ip ||
    req.connection?.remoteAddress ||
    "unknown";
  return `${keyPrefix}:${ip}`;
};

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = "Too many requests. Please try again later.",
    statusCode = 429,
    keyPrefix = "rl",
  } = options;

  return (req, res, next) => {
    const now = Date.now();
    const key = getClientKey(req, keyPrefix);
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(Math.max(1, retryAfterSeconds)));
      return res.status(statusCode).json({ success: false, message });
    }

    return next();
  };
};

module.exports = { rateLimit };
