import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { parse } from 'marked';
import { join, resolve } from 'path';
import { Post } from './posts.const';

import hljs from 'highlight.js/lib/core';

// @ts-ignore
import css from 'highlight.js/lib/languages/css';
// @ts-ignore
import javascript from 'highlight.js/lib/languages/javascript';
// @ts-ignore
import scss from 'highlight.js/lib/languages/scss';
// @ts-ignore
import typescript from 'highlight.js/lib/languages/typescript';
// @ts-ignore
import xml from 'highlight.js/lib/languages/xml';

// Then register the languages you need
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('typescript', typescript);

const files = readdirSync(join(import.meta.dir, './posts'));
const postJsonArray: Post[] = [];

const compileMarkdownFiles = (files: string[]) => {
  for (let index = 0; index < files.length; index++) {
    const fileName = files[index];
    const file = readFileSync(resolve(import.meta.dir, `./posts/${fileName}`), 'utf8');
    const parsed = parse(file) as string;
    const highlightCode = initRecursiveReplace(parsed);
    const finalHtml = replaceFirstImage(highlightCode);

    postJsonArray.push({
      i: postJsonArray.length + index,
      s: fileName.replace('.md', ''),
      c: `<div class="post">${finalHtml}</div>`,
    });
  }
};

function initRecursiveReplace(originString: string): string {
  const dom = new JSDOM(originString);
  const codeElements = dom.window.document.querySelectorAll('code'); // Get all code elements

  for (const element of codeElements) {
    const newContent = hljs.highlightAuto(element.textContent || '');
    const highlightedCode = dom.window.document.createElement('code');
    highlightedCode.classList.add(`language-${newContent.language}`);
    highlightedCode.innerHTML = newContent.value;

    element.parentNode?.replaceChild(highlightedCode, element);
  }

  return dom.serialize();
}

function replaceFirstImage(originString: string): string {
  const dom = new JSDOM(originString);
  const imgElements = dom.window.document.querySelectorAll('img'); // Get all img elements

  let index = 0;

  for (const element of imgElements) {
    const src = element.getAttribute('src');

    if (src && index > 1) {
      element.setAttribute('data-src', src);
      element.removeAttribute('src');
    }

    index += 1;
  }

  return dom.serialize();
}

compileMarkdownFiles(files);

writeFileSync(resolve(import.meta.dir, `./generated-posts.json`), JSON.stringify(postJsonArray));
