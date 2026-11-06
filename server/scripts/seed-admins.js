/**
 * Creates or updates the admin accounts listed in server/seed/admins.json.
 * Safin has no public sign-up: this is the only way accounts are created.
 *   npm run db:seed
 *
 * admins.json is git-ignored. Copy admins.example.json and fill in real values.
 * Each entry: { "name": "...", "email": "...", "password": "..." }
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const env = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/userModel');

const FILE = process.argv[2] || path.join(__dirname, '..', 'seed', 'admins.json');
const MIN_PASSWORD = 6;

const load = () => {
  if (!fs.existsSync(FILE)) {
    throw new Error(`No admin list found at ${FILE}. Copy seed/admins.example.json to seed/admins.json first.`);
  }
  const admins = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  if (!Array.isArray(admins) || admins.length === 0) throw new Error('admins.json must be a non-empty array.');
  for (const a of admins) {
    if (!a.name?.trim() || !a.email?.trim() || !a.password) throw new Error(`Each admin needs name, email and password (${a.email ?? 'unknown'}).`);
    if (String(a.password).length < MIN_PASSWORD) throw new Error(`Password for ${a.email} is shorter than ${MIN_PASSWORD} characters.`);
  }
  return admins;
};

(async () => {
  const admins = load();
  const conn = await connectDB(env.mongoUri);
  console.log(`Connected to ${conn.host}/${conn.name}`);

  for (const { name, email, password } of admins) {
    const cleanEmail = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      existing.name = name.trim();
      existing.password = hashed;
      await existing.save();
      console.log(`• ${cleanEmail}: updated`);
    } else {
      await User.create({ name: name.trim(), email: cleanEmail, password: hashed });
      console.log(`• ${cleanEmail}: created`);
    }
  }

  console.log(`Done. ${await User.countDocuments()} account(s) in total.`);
  await mongoose.disconnect();
})().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
