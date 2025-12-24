import express from 'express';
import { getPosts, getPostsBySearch, getPostsByUser, getPost, createPost, updatePost, likePost, commentPost, likeComment, deleteComment, deletePost, sharePost } from '../controller/posts.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/search', getPostsBySearch);
router.get('/user/:userId', getPostsByUser);
router.get('/', getPosts);
router.get('/:id', getPost); // 🛑 THIS IS THE CRITICAL LINE FOR POST DETAILS

router.post('/', auth, createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);
router.post('/:id/commentPost', auth, commentPost);
router.patch('/:id/comments/:commentId/like', auth, likeComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);
router.patch('/:id/sharePost', auth, sharePost);

export default router;