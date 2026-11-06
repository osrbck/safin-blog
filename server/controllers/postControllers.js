const Post = require('../models/postModel');
const HttpError = require('../utils/httpError');
const { saveImage, removeImage } = require('../utils/upload');
const { POST_CATEGORIES, LIMITS } = require('../utils/constants');

const CREATOR_FIELDS = 'name avatar';
const MIN_DESCRIPTION = 12;

// Editors emit non-breaking spaces for trailing spaces; lone ones are turned back into
// regular spaces so stored paragraphs wrap normally. Runs of them (deliberate spacing) are kept.
const normalizeSpaces = (html) => html.replace(/(?:&nbsp;|\u00a0)(?=[^\s&])/g, ' ');

const validateBody = ({ title, category, description }) => {
  const cleanTitle = String(title ?? '').trim();
  const cleanDescription = normalizeSpaces(String(description ?? '')).trim();
  if (!cleanTitle || !category || !cleanDescription) throw new HttpError('Please fill in all fields.', 422);
  if (!POST_CATEGORIES.includes(category)) throw new HttpError('Please choose a valid category.', 422);
  if (cleanDescription.replace(/<[^>]*>/g, '').trim().length < MIN_DESCRIPTION) {
    throw new HttpError(`Content should be at least ${MIN_DESCRIPTION} characters.`, 422);
  }
  return { title: cleanTitle, category, description: cleanDescription };
};

const listPosts = (filter = {}) =>
  Post.find(filter).sort({ createdAt: -1 }).populate('creator', CREATOR_FIELDS);

// POST /api/posts  (multipart: title, category, description, thumbnail)
const createPost = async (req, res) => {
  const fields = validateBody(req.body ?? {});
  if (!req.files?.thumbnail) throw new HttpError('Please choose a cover image.', 422);

  const thumbnail = await saveImage(req.files.thumbnail, LIMITS.thumbnailBytes, 'Cover image');
  try {
    const post = await Post.create({ ...fields, thumbnail, creator: req.user.id });
    res.status(201).json(await post.populate('creator', CREATOR_FIELDS));
  } catch (error) {
    await removeImage(thumbnail);
    throw error;
  }
};

// GET /api/posts
const getPosts = async (req, res) => {
  res.json(await listPosts());
};

// GET /api/posts/:id
const getPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('creator', CREATOR_FIELDS);
  if (!post) return next(new HttpError('Post not found.', 404));
  res.json(post);
};

// GET /api/posts/categories/:category
const getCatPosts = async (req, res) => {
  res.json(await listPosts({ category: req.params.category }));
};

// GET /api/posts/users/:id
const getUserPosts = async (req, res) => {
  res.json(await listPosts({ creator: req.params.id }));
};

// PATCH /api/posts/:id  (multipart; thumbnail optional)
const editPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new HttpError('Post not found.', 404));
  if (String(post.creator) !== req.user.id) return next(new HttpError('You can only edit your own posts.', 403));

  Object.assign(post, validateBody(req.body ?? {}));

  const oldThumbnail = post.thumbnail;
  if (req.files?.thumbnail) {
    post.thumbnail = await saveImage(req.files.thumbnail, LIMITS.thumbnailBytes, 'Cover image');
  }

  try {
    await post.save();
  } catch (error) {
    if (post.thumbnail !== oldThumbnail) await removeImage(post.thumbnail);
    throw error;
  }
  if (post.thumbnail !== oldThumbnail) await removeImage(oldThumbnail);

  res.json(await post.populate('creator', CREATOR_FIELDS));
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new HttpError('Post not found.', 404));
  if (String(post.creator) !== req.user.id) return next(new HttpError('You can only delete your own posts.', 403));

  await post.deleteOne();
  await removeImage(post.thumbnail);
  res.json({ message: 'Post deleted.' });
};

module.exports = { createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost };
