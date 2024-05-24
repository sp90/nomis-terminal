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
    // const highlightCode = findAndReplaceCodeContents(parsed);
    // const highlightCode = findAndReplaceCodeContentsRecursive(parsed);
    const highlightCode = initRecursiveReplace(parsed);

    postJsonArray.push({
      i: postJsonArray.length + index,
      s: fileName.replace('.md', ''),
      c: `<div class="post">${highlightCode}</div>`,
    });
  }
};

function initRecursiveReplace(originString: string): string {
  const dom = new JSDOM(originString);
  const codeElements = dom.window.document.querySelectorAll('code'); // Get all code elements

  for (const element of codeElements) {
    // Process only unhighlighted <code> elements
    // if (!element.parentNode?.querySelector(`code[class*="language-"]`)) {
    const newContent = hljs.highlightAuto(element.textContent || '');
    const highlightedCode = dom.window.document.createElement('code');
    highlightedCode.classList.add(`language-${newContent.language}`);
    highlightedCode.innerHTML = newContent.value;

    element.parentNode?.replaceChild(highlightedCode, element);
    // }
  }

  return dom.serialize();
}
// function initRecursiveReplace(originString: string): string {
//   const dom = new JSDOM(originString);

//   function replaceRecursiveCode(node: Node = dom.window.document): Node {
//     // Process child nodes first (depth-first traversal)
//     node.childNodes.forEach(child => replaceRecursiveCode(child));

//     // Process the current node if it's a <code> element without the class
//     if (node.nodeName === 'CODE' && !node.parentNode?.querySelector(`code[class*="language-"]`)) {
//       const newContent = hljs.highlightAuto(node.textContent || '');
//       const highlightedCode = dom.window.document.createElement('code');
//       highlightedCode.classList.add(`language-${newContent.language}`);
//       highlightedCode.innerHTML = newContent.value;

//       console.log('newContent.value: ', newContent.value);

//       node.parentNode?.replaceChild(highlightedCode, node);
//     }

//     return node;
//   }

//   replaceRecursiveCode();
//   return dom.serialize();
// }
// function initRecursiveReplace(originString: string): string {
//   let newHtmlString = originString; // Initialize outside the loop
//   let changeCount = 0;

//   return replaceRecursiveCode();

//   function replaceRecursiveCode(): string {
//     const dom = new JSDOM(newHtmlString);
//     const codeElements = dom.window.document.querySelectorAll('code');
//     let hasChanges = false;

//     for (const element of codeElements) {
//       if (!element.classList.contains('language-')) {
//         const newContent = hljs.highlightAuto(element.innerHTML);
//         const originalElementHtml = element.outerHTML;
//         const start = newHtmlString.indexOf(originalElementHtml);
//         const end = start + originalElementHtml.length;
//         const content = `<code class="language-${newContent.language}">${newContent.value}</code>`;

//         newHtmlString = newHtmlString.slice(0, start) + content + newHtmlString.slice(end);
//         hasChanges = true;
//         break; // Exit loop after first replacement
//       }
//     }

//     if (hasChanges) {
//       changeCount++;

//       console.log('changeCount: ', changeCount);

//       return replaceRecursiveCode(); // Recurse without passing newHtmlString
//     }

//     return newHtmlString; // No changes, return the accumulated result
//   }
// }

// function findAndReplaceCodeContents(htmlString: string) {
//   // const parser = new DOMParser();
//   const dom = new JSDOM(htmlString);
//   const codeElements = dom.window.document.querySelectorAll('code');

//   // Array to hold replacement data
//   let replacements: Replacement[] = [];

//   // Extract information and calculate replacements
//   codeElements.forEach((element, index) => {
//     const newContent = hljs.highlightAuto(element.innerHTML);
//     const originalHtml = element.outerHTML;
//     const start = htmlString.indexOf(originalHtml);
//     const end = start + originalHtml.length;
//     const content = `<code class="language-${newContent.language}">${newContent.value}</code>`;

//     replacements.push({ start, end, content });
//   });

//   console.log('structuredClone(replacements): ', structuredClone(replacements));
//   // Sort replacements by start position in descending order
//   replacements.sort((a: Replacement, b: Replacement) => {
//     if (a.start === b.start) {
//       return b.end - a.end;
//     }
//     return b.start - a.start;
//   });

//   console.log('structuredClone(replacements): ', structuredClone(replacements));

//   // Apply replacements from end to start
//   replacements.forEach(({ start, end, content }: Replacement) => {
//     htmlString = htmlString.slice(0, start) + content + htmlString.slice(end);
//   });

//   // console.log('htmlString: ', htmlString);

//   return htmlString;
// }

// function findAndReplaceCodeContentsRecursive(htmlString: string): string {
//   // Base Case: No more <code> tags without classes
//   const codeRegex = /<code(?!\s+class\b)[^>]*>.*?<\/code>/s; // Match <code>...</code> without class
//   if (!codeRegex.test(htmlString)) {
//     return htmlString;
//   }

//   // Find the next unclassed <code> element and its content
//   const match = codeRegex.exec(htmlString);
//   if (!match) return htmlString; // Safety check, shouldn't happen if regex test passed

//   const codeStartIndex = match.index;
//   const codeEndIndex = codeStartIndex + match[0].length;
//   const originalCode = match[0]; // Get the full matched code block

//   // Highlight the code (still strip the tags)
//   const newContent = hljs.highlightAuto(
//     originalCode.substring('<code>'.length, originalCode.length - '</code>'.length)
//   );

//   // Construct the replacement HTML with the language class
//   const replacementCode = `<code class="language-${newContent.language}">${newContent.value}</code>`;

//   // Recurse on the remaining HTML
//   return (
//     findAndReplaceCodeContentsRecursive(htmlString.substring(0, codeStartIndex)) +
//     replacementCode +
//     findAndReplaceCodeContentsRecursive(htmlString.substring(codeEndIndex))
//   );
// }

compileMarkdownFiles(files);

writeFileSync(resolve(import.meta.dir, `./generated-posts.json`), JSON.stringify(postJsonArray));
