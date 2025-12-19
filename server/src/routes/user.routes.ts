import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '../controllers/user.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getAllUsers);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.get('/:id', optionalAuth, getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
