const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not set. Please configure it before starting the server."
  );
}

module.exports = { JWT_SECRET };
