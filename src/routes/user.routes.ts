import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMyProfile,
  getCsrfToken,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getMyProfile);
router.get('/csrf-token', getCsrfToken);
export default router;
