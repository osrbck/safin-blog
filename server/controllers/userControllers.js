const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Post = require('../models/postModel');
const HttpError = require('../utils/httpError');
const { saveImage, removeImage } = require('../utils/upload');
const { LIMITS } = require('../utils/constants');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

// Email is only disclosed to the account owner.
const publicUser = (user, posts = 0, { includeEmail = false } = {}) => ({
  _id: user._id,
  name: user.name,
  ...(includeEmail ? { email: user.email } : {}),
  avatar: user.avatar ?? null,
  posts,
});

const countPosts = (creator) => Post.countDocuments({ creator });

// POST /api/users/login
const loginUser = async (req, res, next) => {
  const { email, password } = req.body ?? {};
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !password) return next(new HttpError('Please fill in all fields.', 422));

  const user = await User.findOne({ email: cleanEmail }).select('+password');
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) return next(new HttpError('Invalid email or password.', 401));

  const token = jwt.sign({ id: user._id, name: user.name }, jwtSecret, { expiresIn: jwtExpiresIn });
  res.json({ token, id: user._id, name: user.name, avatar: user.avatar ?? null });
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new HttpError('User not found.', 404));
  const includeEmail = req.user?.id === String(user._id);
  res.json(publicUser(user, await countPosts(user._id), { includeEmail }));
};

// GET /api/users
const getAuthors = async (req, res) => {
  const authors = await User.aggregate([
    {
      $lookup: {
        from: 'posts',
        let: { uid: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$creator', '$$uid'] } } }, { $count: 'n' }],
        as: 'p',
      },
    },
    { $project: { name: 1, avatar: { $ifNull: ['$avatar', null] }, posts: { $ifNull: [{ $first: '$p.n' }, 0] } } },
    { $sort: { posts: -1, name: 1 } },
  ]);
  res.json(authors);
};

// POST /api/users/change-avatar  (multipart: avatar)
const changeAvatar = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new HttpError('User not found.', 404));

  const fileName = await saveImage(req.files?.avatar, LIMITS.avatarBytes, 'Profile picture');
  const previous = user.avatar;
  user.avatar = fileName;
  try {
    await user.save();
  } catch (error) {
    await removeImage(fileName);
    throw error;
  }
  await removeImage(previous);
  res.json({ avatar: user.avatar });
};

// PATCH /api/users/edit-user
const editUser = async (req, res, next) => {
  const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body ?? {};
  const cleanName = String(name ?? '').trim();
  const cleanEmail = normalizeEmail(email);

  if (!cleanName || !cleanEmail || !currentPassword) return next(new HttpError('Please fill in all fields.', 422));
  if (!EMAIL_RE.test(cleanEmail)) return next(new HttpError('Please enter a valid email address.', 422));

  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new HttpError('User not found.', 404));

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new HttpError('Current password is incorrect.', 422));
  }

  const taken = await User.exists({ email: cleanEmail, _id: { $ne: user._id } });
  if (taken) return next(new HttpError('That email is already registered.', 409));

  if (newPassword) {
    if (String(newPassword).trim().length < MIN_PASSWORD) {
      return next(new HttpError(`New password should be at least ${MIN_PASSWORD} characters.`, 422));
    }
    if (newPassword !== confirmNewPassword) return next(new HttpError('New passwords do not match.', 422));
    user.password = await bcrypt.hash(newPassword, 10);
  }

  user.name = cleanName;
  user.email = cleanEmail;
  await user.save();
  res.json(publicUser(user, await countPosts(user._id), { includeEmail: true }));
};

module.exports = { loginUser, getUser, getAuthors, changeAvatar, editUser };
