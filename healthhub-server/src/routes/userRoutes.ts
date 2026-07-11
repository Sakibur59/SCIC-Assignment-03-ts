import express from 'express';

import { protect, authorize } from '../middleware/auth';
import { deleteUser } from '../controllers/userController';


const router = express.Router();


router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;