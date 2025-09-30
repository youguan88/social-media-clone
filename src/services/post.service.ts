import prisma from '../lib/prisma';
import { sanitize } from '../utils/sanitizer';

export interface CreatePostData {
  content: string;
  authorId: number;
}

export const PostService = {
  async createPost(data: CreatePostData) {
    const sanitizedContent = sanitize(data.content);
    return prisma.post.create({
      data: {
        content: sanitizedContent,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },
  async getAllPosts() {
    return prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },
};
