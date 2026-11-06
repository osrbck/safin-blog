const { Router } = require('express');

const auth = require('../middleware/authMiddleware');
const {
  createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost,
} = require('../controllers/postControllers');

const router = Router();

router.get('/', getPosts);
router.post('/', auth, createPost);
router.get('/categories/:category', getCatPosts);
router.get('/users/:id', getUserPosts);
router.get('/:id', getPost);
router.patch('/:id', auth, editPost);
router.delete('/:id', auth, deletePost);

module.exports = router;
