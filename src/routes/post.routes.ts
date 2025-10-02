import { Router } from 'express';
import { createPost, getAllPosts } from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { csrfProtection } from '../middleware/csrf.middleware';

const router = Router();

router.get('/', getAllPosts);

router.post('/', authenticateToken, csrfProtection, createPost);

export default router;
