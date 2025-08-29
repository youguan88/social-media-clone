import request from 'supertest';
import app from '../index';
import { Post } from '@prisma/client';
import { PostWithAuthor } from '../types/post.types';
import { CreatePostData, PostService } from '../services/post.service';

jest.mock('../middleware/auth.middleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 1 };
    next();
  },
}));

jest.mock('../services/post.service');
const mockedPostService = PostService as jest.Mocked<typeof PostService>;

describe('POST /api/posts', () => {
  it('should create a post when authenticated', async () => {
    type PostInput = Pick<CreatePostData, 'content'>;
    const postInput: PostInput = {
      content: 'Test post from an authenticated user',
    };
    const expectedPost: Post = {
      id: 1,
      content: postInput.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 1,
    };
    mockedPostService.createPost.mockResolvedValue(expectedPost);

    const response = await request(app).post('/api/posts').send(postInput);

    expect(response.status).toBe(201);
    expect(response.body.content).toBe(postInput.content);
    expect(PostService.createPost).toHaveBeenCalledWith({
      content: postInput.content,
      authorId: 1, // Comes from the mocked middleware user
    });
  });
});

describe('GET /api/posts', () => {
  it('should return a list of all posts', async () => {
    const fakePosts: PostWithAuthor[] = [
      {
        id: 1,
        content: 'This is the first post',
        author: {
          id: 1,
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
          email: 'user2@example.com',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 2,
      },
    ];
    mockedPostService.getAllPosts.mockResolvedValue(fakePosts);
    const response = await request(app).get('/api/posts');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].content).toBe(fakePosts[0].content);
    expect(response.body[1].author.email).toBe(fakePosts[1].author.email);
    expect(PostService.getAllPosts).toHaveBeenCalled();
  });
});
