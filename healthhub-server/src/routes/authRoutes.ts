import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  updateProfilePicture 
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile/picture', protect, updateProfilePicture);

export default router;