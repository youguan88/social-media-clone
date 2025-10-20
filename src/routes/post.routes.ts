import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostsByUsername,
} from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { csrfProtection } from '../middleware/csrf.middleware';

const router = Router();

router.get('/', getAllPosts);
router.get('/by/:username', getPostsByUsername);

router.post('/', authenticateToken, csrfProtection, createPost);

export default router;
