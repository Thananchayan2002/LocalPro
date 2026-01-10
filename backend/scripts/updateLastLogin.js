const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const updateLastLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all users without lastLogin to set it to their createdAt date
    const result = await User.updateMany(
      { lastLogin: { $exists: false } },
      { $set: { lastLogin: new Date() } }
    );

    // Also handle users where lastLogin is null
    const result2 = await User.updateMany(
      { lastLogin: null },
      { $set: { lastLogin: new Date() } }
    );

    console.log(`Updated ${result.modifiedCount} users (no lastLogin field)`);
    console.log(`Updated ${result2.modifiedCount} users (null lastLogin)`);
    console.log("Migration complete!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

updateLastLogin();
