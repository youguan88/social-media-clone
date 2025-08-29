import { Request, Response } from 'express';
import { PostService } from '../services/post.service';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const authorId = req.user?.userId;
    if (!content) {
      return res.status(400).json({ message: 'Post content is required.' });
    }
    if (!authorId) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    const newPost = await PostService.createPost({ content, authorId });
    res.status(201).json(newPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'An error occured while creating the post.' });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await PostService.getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'An error occured while fetching posts.' });
  }
};
