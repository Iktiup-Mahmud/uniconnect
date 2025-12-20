import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getUserPosts,
} from '../controllers/post.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getAllPosts);
router.get('/user/:userId', optionalAuth, getUserPosts);
router.get('/user', authenticate, getUserPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);

export default router;
