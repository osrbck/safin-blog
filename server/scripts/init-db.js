/**
 * Creates the `safin` database collections with JSON-schema validation and indexes.
 * Idempotent: safe to run repeatedly (uses collMod on existing collections).
 *   npm run db:init
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const { POST_CATEGORIES } = require('../utils/constants');

const usersSchema = {
  bsonType: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: { bsonType: 'string', maxLength: 80 },
    email: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    password: { bsonType: 'string' },
    avatar: { bsonType: ['string', 'null'] },
    createdAt: { bsonType: 'date' },
  },
};

const postsSchema = {
  bsonType: 'object',
  required: ['title', 'category', 'description', 'thumbnail', 'creator'],
  properties: {
    title: { bsonType: 'string', maxLength: 160 },
    category: { enum: POST_CATEGORIES },
    description: { bsonType: 'string' },
    thumbnail: { bsonType: 'string' },
    creator: { bsonType: 'objectId' },
    createdAt: { bsonType: 'date' },
    updatedAt: { bsonType: 'date' },
  },
};

const UNAUTHORIZED_CODES = new Set([13, 8000]); // Unauthorized, AtlasError (role lacks collMod)

const ensureCollection = async (db, name, $jsonSchema) => {
  const exists = await db.listCollections({ name }).hasNext();
  const options = { validator: { $jsonSchema }, validationLevel: 'moderate', validationAction: 'error' };
  try {
    if (exists) {
      await db.command({ collMod: name, ...options });
      console.log(`• ${name}: validator updated`);
    } else {
      await db.createCollection(name, options);
      console.log(`• ${name}: created with validator`);
    }
  } catch (error) {
    if (!UNAUTHORIZED_CODES.has(error.code) || !/not allowed/i.test(error.message)) throw error;
    if (!exists) await db.createCollection(name);
    console.warn(`• ${name}: ${exists ? 'exists' : 'created'}, validator skipped (grant the dbAdmin role on "safin" to enable schema validation)`);
  }
};

(async () => {
  const conn = await connectDB(env.mongoUri);
  console.log(`Connected to ${conn.host}/${conn.name}`);

  await ensureCollection(conn.db, User.collection.name, usersSchema);
  await ensureCollection(conn.db, Post.collection.name, postsSchema);

  await User.syncIndexes();
  await Post.syncIndexes();
  console.log('• indexes synced');

  for (const Model of [User, Post]) {
    const indexes = await Model.collection.indexes();
    console.log(`  ${Model.collection.name}: ${indexes.map((i) => i.name).join(', ')}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((error) => {
  console.error('Database initialisation failed:', error.message);
  process.exit(1);
});
