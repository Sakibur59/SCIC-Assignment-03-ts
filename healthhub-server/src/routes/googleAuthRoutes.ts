import express from 'express';
import {
  getGoogleAuthURL,
  googleCallback,
  googleLogin,
} from '../controllers/googleAuthController';

const router = express.Router();

router.get('/auth-url', getGoogleAuthURL);
router.get('/callback', googleCallback);
router.post('/login', googleLogin);

export default router;