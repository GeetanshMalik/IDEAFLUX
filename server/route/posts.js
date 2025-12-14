import express from 'express';
import { getPosts, getPostsBySearch, getPost, createPost, updatePost, likePost, commentPost, deletePost } from '../controller/posts.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/search', getPostsBySearch);
router.get('/', getPosts);
router.get('/:id', getPost); // 🛑 THIS IS THE CRITICAL LINE FOR POST DETAILS

router.post('/', auth, createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);
router.post('/:id/commentPost', auth, commentPost);

export default router;