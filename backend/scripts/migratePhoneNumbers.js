/**
 * Migration Script: Populate phoneNumber field for existing users
 *
 * Run this script ONCE after deploying the new User model schema
 * to ensure existing users have the phoneNumber field populated
 * from their legacy phone field.
 *
 * Usage: node scripts/migratePhoneNumbers.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

async function migratePhoneNumbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find users without phoneNumber field
    const usersWithoutPhoneNumber = await User.find({
      $or: [
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { phoneNumber: "" },
      ],
    });

    console.log(
      `Found ${usersWithoutPhoneNumber.length} users without phoneNumber field`
    );

    let migrated = 0;
    let skipped = 0;

    for (const user of usersWithoutPhoneNumber) {
      if (user.phone) {
        // Populate phoneNumber from phone field
        user.phoneNumber = user.phone;
        await user.save();
        migrated++;
        console.log(`✓ Migrated user ${user._id}: ${user.phone}`);
      } else {
        // Skip users without any phone field
        skipped++;
        console.log(`✗ Skipped user ${user._id}: No phone field found`);
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total users processed: ${usersWithoutPhoneNumber.length}`);
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Skipped (no phone): ${skipped}`);

    // Verify migration
    const usersStillMissing = await User.find({
      $or: [
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { phoneNumber: "" },
      ],
    });

    if (usersStillMissing.length > 0) {
      console.log(
        `\n⚠️  Warning: ${usersStillMissing.length} users still missing phoneNumber`
      );
      usersStillMissing.forEach((user) => {
        console.log(`  - User ID: ${user._id}, Email: ${user.email || "N/A"}`);
      });
    } else {
      console.log("\n✓ All users have phoneNumber field populated");
    }

    mongoose.connection.close();
    console.log("\nMongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migratePhoneNumbers();
