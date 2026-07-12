import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Admin only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;