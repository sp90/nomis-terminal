export type PostPreview = {
  i: number;
  s: string;
};

export type Post = {
  i: number;
  s: string;
  c: string;
};

export const POSTS = [
  {
    i: 0,
    s: 'hello-angular-universal',
    c: 'This is the first blog post'
  },
  {
    i: 1,
    s: 'second-blog-post',
    c: 'This is the second blog post'
  },
  {
    i: 2,
    s: 'third-blog-post',
    c: 'This is the third blog post'
  }
];

export const POSTS_LIST = POSTS.map((p) => ({ i: p.i, s: p.s }));
