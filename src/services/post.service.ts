import prisma from '../lib/prisma';

export interface CreatePostData {
  content: string;
  authorId: number;
}

export const PostService = {
  async createPost(data: CreatePostData) {
    return prisma.post.create({
      data: {
        content: data.content,
        authorId: data.authorId,
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
