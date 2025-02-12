// import '@angular/compiler';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { POSTS, POSTS_LIST } from 'posts.const';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/nomis-terminal/browser');
  const indexHtml = existsSync(join(distFolder, 'index.csr.html'))
    ? join(distFolder, 'index.csr.html')
    : join(distFolder, 'index.html');

  const commonEngine = new CommonEngine();

  // console.log('distFolder: ', distFolder);

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  server.get('/api/posts', (_, res) => {
    res.send(POSTS_LIST);
  });

  server.get('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const post = POSTS.find(p => p.i === id);

    if (post) {
      res.send(post);
    } else {
      res.status(404).send({ error: 'Post not found' });
    }
  });

  server.get('/api/posts/slug/:slug', (req, res) => {
    const post = POSTS.find(p => p.s === req.params.slug);

    if (post) {
      res.send(post);
    } else {
      res.status(404).send({ error: 'Post not found' });
    }
  });

  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: req.originalUrl,
        publicPath: distFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
      })
      .then(html => {
        if (req.originalUrl === '/5-tips-to-become-better-at-css') {
          // console.log('req.originalUrl: ', req.originalUrl);
          // console.log('html: ', html);
        }

        return res.send(html);
      })
      .catch(err => next(err));
  });

  return server;
}

// function run(): void {
const port = process.env['PORT'] || 4203;

// Start up the Node server
const server = app();
server.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
// }

// // Webpack will replace 'require' with '__webpack_require__'
// // '__non_webpack_require__' is a proxy to Node 'require'
// // The below code is to ensure that the server is run only when not requiring the bundle.
// declare const __non_webpack_require__: NodeRequire;
// const mainModule = __non_webpack_require__.main;
// const moduleFilename = (mainModule && mainModule.filename) || '';
// if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
//   run();
// }

// export default bootstrap;
