import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMyProfile,
  getCsrfToken,
  getUserProfile,
  followUser,
  unfollowUser,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { csrfProtection } from '../middleware/csrf.middleware';
import { paths } from '../constants';

const router = Router();

// Auth routes
router.post(paths.users.register, registerUser);
router.post(paths.users.login, loginUser);
router.get(paths.users.me, authenticateToken, getMyProfile);
router.get(paths.users.csrf, getCsrfToken);

// Public profile route
router.get(paths.users.profile, getUserProfile);

// Follow-related routes
router.post(paths.users.follow, authenticateToken, csrfProtection, followUser);
router.delete(
  paths.users.follow,
  authenticateToken,
  csrfProtection,
  unfollowUser,
);

export default router;
