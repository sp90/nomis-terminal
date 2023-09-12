import 'zone.js/dist/zone-node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { staticPlugin } from '@elysiajs/static';
import Elysia from 'elysia';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { POSTS, POSTS_LIST } from 'posts.const';
import bootstrap from './src/main.server';

const distFolder = join(process.cwd(), 'dist/nomis-terminal/browser');
const indexHtml = existsSync(join(distFolder, 'index.original.html'))
  ? join(distFolder, 'index.original.html')
  : join(distFolder, 'index.html');

const commonEngine = new CommonEngine();

const app = new Elysia()
  .get('/api/posts', (_) => POSTS_LIST)
  .get('/api/posts/:id', (c) => {
    const id = parseInt(c.params['id'], 10);
    const post = POSTS.find((p) => p.i === id);

    if (post) {
      return post;
    } else {
      return { error: 'Post not found' };
    }
  })
  .group('*.*', (app) =>
    app.use(
      staticPlugin({
        assets: distFolder,
        prefix: ''
      })
    )
  )
  .get('*', async (c) => {
    const url = new URL(c.request.url);

    try {
      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url: c.request.url,
        publicPath: distFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: url.origin }]
      });

      return html;
    } catch (err) {
      return err;
    }
  })
  .listen(8080);

export default bootstrap;
