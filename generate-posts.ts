import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { marked } from 'marked';
import { join, resolve } from 'path';
import { Post } from 'posts.const';

const files = readdirSync(join(__dirname, './posts'));
const postJsonArray = [] as Post[];

const compileMarkdownFiles = (files: string[]) => {
  for (let index = 0; index < files.length; index++) {
    const fileName = files[index];
    const file = readFileSync(resolve(__dirname, `./posts/${fileName}`), 'utf8');
    const html = marked.parse(file);

    postJsonArray.push({
      i: postJsonArray.length + index,
      s: fileName.replace('.md', ''),
      c: `<div class="post">${html}</div>`
    });
  }
};

compileMarkdownFiles(files);

writeFileSync(resolve(__dirname, `./generated-posts.json`), JSON.stringify(postJsonArray));
