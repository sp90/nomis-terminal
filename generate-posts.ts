import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { parse } from 'marked';
import { join, resolve } from 'path';
import { Post } from './posts.const';

import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import scss from 'highlight.js/lib/languages/scss';
import typescript from 'highlight.js/lib/languages/typescript';
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
    const highlightCode = findAndReplaceCodeContents(parsed);

    postJsonArray.push({
      i: postJsonArray.length + index,
      s: fileName.replace('.md', ''),
      c: `<div class="post">${highlightCode}</div>`,
    });
  }
};

function findAndReplaceCodeContents(htmlString: string) {
  // const parser = new DOMParser();
  const dom = new JSDOM(htmlString);
  const codeElements = dom.window.document.querySelectorAll('code');

  type Replacement = {
    start: number;
    end: number;
    content: string;
  };
  // Array to hold replacement data
  let replacements: Replacement[] = [];

  // Extract information and calculate replacements
  codeElements.forEach((element, index) => {
    const newContent = hljs.highlightAuto(element.innerHTML);
    const originalHtml = element.outerHTML;
    const start = htmlString.indexOf(originalHtml);
    const end = start + originalHtml.length;
    const content = `<code class="language-${newContent.language}">${newContent.value}</code>`;

    replacements.push({ start, end, content });
  });

  // Sort replacements by start position in descending order
  replacements.sort((a: Replacement, b: Replacement) => b.start - a.start);

  // Apply replacements from end to start
  replacements.forEach(({ start, end, content }: Replacement) => {
    htmlString = htmlString.slice(0, start) + content + htmlString.slice(end);
  });

  console.log('htmlString: ', htmlString);

  return htmlString;
}

compileMarkdownFiles(files);

writeFileSync(resolve(import.meta.dir, `./generated-posts.json`), JSON.stringify(postJsonArray));
