/**
 * Creates or updates the editorial posts listed in server/seed/posts/posts.json.
 *   npm run db:seed-posts                       # all posts
 *   npm run db:seed-posts -- --dry-run          # validate and report, write nothing
 *   npm run db:seed-posts -- --only=oleander    # a single post
 *
 * Each manifest entry: { slug, title, category, author (email), file (HTML body), cover (JPEG) },
 * with paths relative to seed/posts. Safe to run repeatedly and on several machines that share
 * one database: covers are always (re)copied into this machine's uploads folder as seed-<slug>.jpg,
 * posts are matched by { creator, title } or by that thumbnail name, and nothing is ever deleted.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const env = require('../config/env');
const connectDB = require('../config/db');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const { POST_CATEGORIES, LIMITS } = require('../utils/constants');
const { UPLOAD_DIR } = require('../utils/upload');

const SEED_DIR = path.join(__dirname, '..', 'seed', 'posts');
const MANIFEST = path.join(SEED_DIR, 'posts.json');
const MAX_TITLE = 160;
const MIN_TEXT = 12;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SPACING_MS = 60 * 1000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length).trim() : null;
const unknown = args.filter((a) => a !== '--dry-run' && !a.startsWith('--only='));

const thumbnailName = (slug) => `seed-${slug}.jpg`;

/** Resolves a manifest path and refuses anything that escapes seed/posts. */
const resolveInSeedDir = (rel, label, slug) => {
  const abs = path.resolve(SEED_DIR, String(rel ?? ''));
  if (!rel || !abs.startsWith(SEED_DIR + path.sep)) throw new Error(`${slug}: ${label} path "${rel}" must point inside seed/posts.`);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) throw new Error(`${slug}: ${label} file not found at ${abs}.`);
  return abs;
};

const load = () => {
  if (unknown.length) throw new Error(`Unknown argument(s): ${unknown.join(' ')}. Use --dry-run and/or --only=<slug>.`);
  if (onlyArg && !only) throw new Error('--only needs a slug, e.g. --only=oleander.');
  if (!fs.existsSync(MANIFEST)) throw new Error(`No manifest found at ${MANIFEST}.`);

  const entries = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('posts.json must be a non-empty array.');

  const slugs = new Set();
  const titles = new Set();
  const posts = entries.map((entry, index) => {
    const slug = String(entry.slug ?? '').trim();
    if (!SLUG_RE.test(slug)) throw new Error(`Entry #${index + 1}: slug "${entry.slug ?? ''}" must be lowercase letters, digits and dashes.`);
    if (slugs.has(slug)) throw new Error(`Duplicate slug "${slug}".`);
    slugs.add(slug);

    const title = String(entry.title ?? '').trim();
    if (!title) throw new Error(`${slug}: title is missing.`);
    if (title.length > MAX_TITLE) throw new Error(`${slug}: title is ${title.length} characters (max ${MAX_TITLE}).`);
    if (titles.has(title.toLowerCase())) throw new Error(`${slug}: duplicate title "${title}".`);
    titles.add(title.toLowerCase());

    if (!POST_CATEGORIES.includes(entry.category)) {
      throw new Error(`${slug}: category "${entry.category}" is not one of: ${POST_CATEGORIES.join(', ')}.`);
    }
    const author = String(entry.author ?? '').trim().toLowerCase();
    if (!author.includes('@')) throw new Error(`${slug}: author must be the creator's email address.`);

    const htmlPath = resolveInSeedDir(entry.file, 'HTML', slug);
    const description = fs.readFileSync(htmlPath, 'utf8').trim();
    if (description.replace(/<[^>]*>/g, '').trim().length < MIN_TEXT) throw new Error(`${slug}: ${entry.file} has no real content.`);

    const coverPath = resolveInSeedDir(entry.cover, 'cover', slug);
    const cover = fs.readFileSync(coverPath);
    if (cover.length >= LIMITS.thumbnailBytes) {
      throw new Error(`${slug}: cover is ${(cover.length / 1048576).toFixed(2)} MB (must be under ${LIMITS.thumbnailBytes / 1048576} MB).`);
    }
    if (cover[0] !== 0xff || cover[1] !== 0xd8) throw new Error(`${slug}: cover ${entry.cover} is not a JPEG file.`);

    return { index, slug, title, category: entry.category, author, description, cover, thumbnail: thumbnailName(slug) };
  });

  if (only && !slugs.has(only)) throw new Error(`--only=${only}: no such slug in posts.json.`);
  return posts;
};

/** Makes sure uploads/seed-<slug>.jpg exists with the manifest's bytes. Returns what happened. */
const ensureThumbnail = ({ thumbnail, cover }) => {
  const target = path.join(UPLOAD_DIR, thumbnail);
  const current = fs.existsSync(target) ? fs.readFileSync(target) : null;
  if (current && current.equals(cover)) return 'present';
  if (!dryRun) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(target, cover);
  }
  return current ? 'replaced' : 'copied';
};

(async () => {
  const all = load();
  const selected = only ? all.filter((p) => p.slug === only) : all;
  console.log(`${dryRun ? '[dry run] ' : ''}${all.length} post(s) in manifest, ${selected.length} selected.`);

  const conn = await connectDB(env.mongoUri);
  console.log(`Connected to ${conn.host}/${conn.name}`);

  const creators = new Map();
  for (const email of new Set(selected.map((p) => p.author))) {
    const user = await User.findOne({ email });
    if (!user) throw new Error(`No user with email ${email}. Run npm run db:seed first.`);
    creators.set(email, user);
  }

  // Newest first on Home: the first manifest entry gets "now", each following one a minute earlier.
  const baseTime = Date.now();
  const counts = { created: 0, updated: 0, unchanged: 0 };

  // Insert in reverse manifest order so creation order matches the timestamps as well.
  for (const post of [...selected].reverse()) {
    const creator = creators.get(post.author);
    const image = ensureThumbnail(post);
    const fields = { title: post.title, category: post.category, description: post.description, thumbnail: post.thumbnail };

    const matches = await Post.find({
      $or: [{ creator: creator._id, title: post.title }, { thumbnail: post.thumbnail }],
    }).sort({ createdAt: 1 });
    if (matches.length > 1) console.warn(`  ! ${post.slug}: ${matches.length} posts match; updating the oldest (${matches[0]._id}).`);
    const existing = matches[0];

    let status;
    if (existing) {
      const changed = Object.keys(fields).filter((key) => existing[key] !== fields[key]);
      if (String(existing.creator) !== String(creator._id)) changed.push('creator');
      if (changed.length === 0) {
        status = 'unchanged';
      } else {
        if (!dryRun) {
          Object.assign(existing, fields, { creator: creator._id });
          await existing.save();
        }
        status = `updated (${changed.join(', ')})`;
      }
      counts[changed.length ? 'updated' : 'unchanged'] += 1;
    } else {
      const at = new Date(baseTime - post.index * SPACING_MS);
      if (!dryRun) {
        // timestamps: false keeps Mongoose from overwriting the createdAt/updatedAt set here.
        await new Post({ ...fields, creator: creator._id, createdAt: at, updatedAt: at }).save({ timestamps: false });
      }
      status = `created (${at.toISOString()})`;
      counts.created += 1;
    }

    const verb = dryRun ? 'would be ' : '';
    console.log(`• ${post.slug}: ${verb}${status}; image ${image === 'present' ? 'present' : `${verb}${image}`}`);
  }

  console.log(
    `${dryRun ? '[dry run] ' : ''}Done. ${counts.created} created, ${counts.updated} updated, ${counts.unchanged} unchanged.`
  );
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error('Seeding posts failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
