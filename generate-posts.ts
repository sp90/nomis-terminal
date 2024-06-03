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
import sharp from 'sharp';

const CACHE_FILE_PLACEHOLDER = 'placeholder_cache.json';

let cache: any = {};

async function getCache() {
  try {
    // Read cache using Bun.readFile
    const cacheFile = Bun.file(CACHE_FILE_PLACEHOLDER, 'utf-8');
    const cacheData = await cacheFile.text();

    cache = JSON.parse(cacheData);
  } catch (err) {
    // Handle cache file not found or other errors
    if (err.code !== 'ENOENT') {
      // ENOENT means file not found
      console.error('Error reading cache:', err);
    }
  }
}

// Then register the languages you need
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('typescript', typescript);

const files = readdirSync(join(import.meta.dir, './posts'));
const postJsonArray: Post[] = [];

const compileMarkdownFiles = async (files: string[]) => {
  await getCache();

  for (let index = 0; index < files.length; index++) {
    const fileName = files[index];
    const file = readFileSync(resolve(import.meta.dir, `./posts/${fileName}`), 'utf8');
    const parsed = parse(file) as string;
    const highlightCode = initRecursiveReplace(parsed);
    const finalHtml = await replaceFirstImage(highlightCode);

    postJsonArray.push({
      i: postJsonArray.length + index,
      s: fileName.replace('.md', ''),
      c: `<div class="post">${finalHtml}</div>`,
    });
  }

  // Write cache to file
  await Bun.write(CACHE_FILE_PLACEHOLDER, JSON.stringify(cache));
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

async function replaceFirstImage(originString: string): Promise<string> {
  const dom = new JSDOM(originString);
  const imgElements = dom.window.document.querySelectorAll('img'); // Get all img elements

  for (const element of imgElements) {
    const src = element.getAttribute('src');

    if (src) {
      const placeholder = await createPlaceholder(src);

      if (placeholder) {
        element.setAttribute('data-src', src);
        element.setAttribute('src', placeholder.placeholderSrc);

        if (placeholder.originalWidth) {
          element.setAttribute('width', placeholder.originalWidth + 'px');
        }

        if (placeholder.originalHeight) {
          element.setAttribute('height', placeholder.originalHeight + 'px');
        }
      } else {
        element.setAttribute('data-src', src);
        element.removeAttribute('src');
      }
    }
  }

  return dom.serialize();
}

async function createPlaceholder(src: string) {
  if (cache[src]) {
    return cache[src];
  }

  try {
    // Fetch image data
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();

    // Get original dimensions using Sharp
    const { width: originalWidth, height: originalHeight } = await sharp(
      new Uint8Array(arrayBuffer)
    ).metadata();

    // Use Sharp to resize and convert to base64 (maintaining aspect ratio)
    const buffer = await sharp(new Uint8Array(arrayBuffer))
      .resize({ width: 8, height: 8, fit: 'contain' }) // Resize with aspect ratio
      .toBuffer();

    const placeholderObj = {
      placeholderSrc: `data:image/png;base64,${buffer.toString('base64')}`,
      originalWidth,
      originalHeight,
    };

    cache[src] = placeholderObj;

    return placeholderObj;
  } catch (error) {
    console.error('Error creating placeholder:', error);
    return '';
  }
}

await compileMarkdownFiles(files);

writeFileSync(resolve(import.meta.dir, `./generated-posts.json`), JSON.stringify(postJsonArray));
