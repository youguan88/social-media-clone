import { prismaMock } from '../test-setup/singleton';
import { CreatePostData, PostService } from './post.service';
import { Post } from '@prisma/client';
import { PostWithAuthor } from '../types/post.types';

describe('PostService', () => {
  describe('getAllPosts', () => {
    it('should retrive all posts with their authors', async () => {
      const fakePosts: PostWithAuthor[] = [
        {
          id: 1,
          content: 'First post',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { id: 1, username: 'test', email: 'user@example.com' },
        },
      ];
      prismaMock.post.findMany.mockResolvedValue(fakePosts);
      const posts = await PostService.getAllPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].content).toBe(fakePosts[0].content);
      expect(posts[0].author.email).toBe(fakePosts[0].author.email);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const postInput: CreatePostData = {
        content: 'A new post!',
        authorId: 1,
      };
      const expectedPost: Post = {
        id: 1,
        ...postInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.post.create.mockResolvedValue(expectedPost);

      const newPost = await PostService.createPost(postInput);
      expect(newPost.content).toBe(postInput.content);
      expect(newPost.authorId).toBe(postInput.authorId);
    });
  });

  describe('getPostsByUsername', () => {
    it('should return all posts for a specific user, ordered by creation date', async () => {
      const username = 'testuser';
      const mockPosts: PostWithAuthor[] = [
        {
          id: 1,
          content: 'Post 1 by testuser',
          authorId: 10,
          author: {
            id: 10,
            email: 'test@example.com',
            username: username,
          },
          createdAt: new Date('2025-10-10T10:00:00Z'),
          updatedAt: new Date('2025-10-10T10:00:00Z'),
        },
        {
          id: 2,
          content: 'Post 2 by testuser',
          authorId: 10,
          author: {
            id: 10,
            email: 'test@example.com',
            username: username,
          },
          createdAt: new Date('2025-10-09T10:00:00Z'),
          updatedAt: new Date('2025-10-09T10:00:00Z'),
        },
      ];
      prismaMock.post.findMany.mockResolvedValue(mockPosts);

      const result = await PostService.getPostsByUsername(username);

      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        where: {
          author: {
            username: username,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockPosts);
      expect(result.length).toBe(2);
      expect(result[0].content).toBe(mockPosts[0].content);
    });
    it('should return an empty array if the user has no posts', async () => {
      const username = 'noposts';

      prismaMock.post.findMany.mockResolvedValue([]);

      const result = await PostService.getPostsByUsername(username);

      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        where: { author: { username: username } },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
    it('should return an empty array if the user does not exist', async () => {
      const username = 'nonexistent';
      prismaMock.post.findMany.mockResolvedValue([]);
      const result = await PostService.getPostsByUsername(username);
      expect(result).toEqual([]);
    });
  });
});
