import { Router } from 'express';
import { createPost, getAllPosts } from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllPosts);

router.post('/', authenticateToken, createPost);

export default router;
