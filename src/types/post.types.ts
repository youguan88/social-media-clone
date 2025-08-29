import { PostService } from '../services/post.service';

type AllPostsPromise = ReturnType<typeof PostService.getAllPosts>;
type AllPostsArray = Awaited<AllPostsPromise>;
export type PostWithAuthor = AllPostsArray[number];
