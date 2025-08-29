import { prismaMock } from '../test-setup/singleton';
import { CreatePostData, PostService } from './post.service';
import { Post } from '@prisma/client';
import { PostWithAuthor } from '../types/post.types';

describe('PostService.getAllPosts', () => {
  it('should retrive all posts with their authors', async () => {
    const fakePosts: PostWithAuthor[] = [
      {
        id: 1,
        content: 'First post',
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: 1, email: 'user@example.com' },
      },
    ];
    prismaMock.post.findMany.mockResolvedValue(fakePosts);
    const posts = await PostService.getAllPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].content).toBe(fakePosts[0].content);
    expect(posts[0].author.email).toBe(fakePosts[0].author.email);
  });
});

describe('PostService.createPost', () => {
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
    expect(prismaMock.post.create).toHaveBeenCalledWith({ data: postInput });
  });
});
