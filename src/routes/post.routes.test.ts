import request from 'supertest';
import app from '../index';
import { Post, User } from '@prisma/client';
import { PostWithAuthor } from '../types/post.types';
import { CreatePostData, PostService } from '../services/post.service';
import { createPath, paths } from '../constants';

jest.mock('../middleware/auth.middleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 1 };
    next();
  },
}));

jest.mock('../services/post.service');
const mockedPostService = PostService as jest.Mocked<typeof PostService>;
const BASE_PATH = `${paths.api}${paths.posts.base}`;

describe('Post Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${BASE_PATH}`, () => {
    it('should return a list of all posts', async () => {
      const fakePosts: PostWithAuthor[] = [
        {
          id: 1,
          content: 'This is the first post',
          author: {
            id: 1,
            username: 'test1',
            email: 'user1@example.com',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 1,
        },
        {
          id: 2,
          content: 'This is the second post',
          author: {
            id: 2,
            username: 'test2',
            email: 'user2@example.com',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 2,
        },
      ];
      mockedPostService.getAllPosts.mockResolvedValue(fakePosts);

      const response = await request(app).get(BASE_PATH);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].content).toBe(fakePosts[0].content);
      expect(response.body[1].author.email).toBe(fakePosts[1].author.email);
      expect(PostService.getAllPosts).toHaveBeenCalled();
    });
  });

  describe(`GET ${paths.posts.byUsername}`, () => {
    it('should return posts for a specific user', async () => {
      const username = 'UserA';
      const path = createPath(paths.posts.byUsername, { username });
      const mockPosts: PostWithAuthor[] = [
        {
          id: 1,
          content: 'First post',
          authorId: 1,
          author: {
            id: 1,
            email: 'test@test.com',
            username: username,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockedPostService.getPostsByUsername.mockResolvedValue(mockPosts);

      const response = await request(app).get(`${BASE_PATH}${path}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].author.username).toBe(username);
      expect(mockedPostService.getPostsByUsername).toHaveBeenCalledWith(
        username,
      );
    });
  });

  describe(`POST ${BASE_PATH}`, () => {
    it('should create a post when authenticated', async () => {
      type PostInput = Pick<CreatePostData, 'content'>;
      type PostPayLoad = Post & { author: Pick<User, 'id' | 'email'> };
      const postInput: PostInput = {
        content: 'Test post from an authenticated user',
      };
      const fakeUser = { id: 1, email: 'test@example.com' };
      const csrfToken = 'test-csrf-token-123';
      const expectedPost: PostPayLoad = {
        id: 1,
        content: postInput.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: fakeUser.id,
        author: fakeUser,
      };
      mockedPostService.createPost.mockResolvedValue(expectedPost);

      const response = await request(app)
        .post(BASE_PATH)
        .set('Cookie', [`csrf_token=${csrfToken}`])
        .set('X-CSRF-Token', csrfToken)
        .send(postInput);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe(postInput.content);
      expect(PostService.createPost).toHaveBeenCalledWith({
        content: postInput.content,
        authorId: fakeUser.id,
      });
    });
  });
});
