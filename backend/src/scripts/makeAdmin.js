// One-off CLI script to promote an existing user to the "admin" role.
// Admin accounts are never created through a public signup form on purpose —
// this keeps privilege escalation off the network entirely.
//
// Usage (from backend/):
//   node -r dotenv/config src/scripts/makeAdmin.js you@example.com
//
// Or add a script to package.json:
//   "make-admin": "node -r dotenv/config src/scripts/makeAdmin.js"

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { User } from "../models/user.model.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: node src/scripts/makeAdmin.js <user-email>");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ ${user.email} is now an admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to promote user:", error);
    process.exit(1);
  }
};

run();
