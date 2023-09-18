import generatedPosts from './generated-posts.json';

export type PostPreview = {
  i: number;
  s: string;
};

export type Post = {
  i: number;
  s: string;
  c: string;
};

export const POSTS = generatedPosts as Post[];
export const POSTS_LIST = (generatedPosts as Post[]).map((p) => ({ i: p.i, s: p.s }));
