const { Router } = require('express');
const rateLimit = require('express-rate-limit');

const auth = require('../middleware/authMiddleware');
const { optionalAuth } = auth;
const {
  loginUser, getUser, getAuthors, changeAvatar, editUser,
} = require('../controllers/userControllers');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

const router = Router();

router.post('/login', authLimiter, loginUser);
router.get('/', getAuthors);
router.post('/change-avatar', auth, changeAvatar);
router.patch('/edit-user', auth, editUser);
router.get('/:id', optionalAuth, getUser);

module.exports = router;
