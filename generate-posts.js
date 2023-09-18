// import { readFileSync, readdirSync, writeFileSync } from 'fs';
// import { marked } from 'marked';
// import { join, resolve } from 'path';

const path = require('path');
const fs = require('fs');
const marked = require('marked');

const files = fs.readdirSync(path.join(__dirname, './posts'));
const postJsonArray = [];

const compileMarkdownFiles = (files) => {
  for (let index = 0; index < files.length; index++) {
    const fileName = files[index];
    const file = fs.readFileSync(path.resolve(__dirname, `./posts/${fileName}`), 'utf8');
    const html = marked.parse(file);

    postJsonArray.push({
      i: postJsonArray.length + index,
      s: fileName.replace('.md', ''),
      c: `<div class="post">${html}</div>`
    });
  }
};

compileMarkdownFiles(files);

fs.writeFileSync(path.resolve(__dirname, `./generated-posts.json`), JSON.stringify(postJsonArray));
