console.log('[BOOT] api/app.ts loaded');

import express from 'express';
import path from 'path';
import apiRoutes from './routes.js';
import store from './storage.js';

const COLLECTIONS = ['users', 'jaaps', 'subscriptions', 'palm_readings'];

export function createAppSync() {
  console.log('[APP] createAppSync() start');
  store.initSync();
  store.seed(...COLLECTIONS);
  console.log('[APP] store initialized');

  const app = express();

  app.use(express.json({ limit: '50mb' }));

  app.use((req, _res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/ping', (_req, res) => {
    console.log('[PING] /api/ping hit');
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use('/api', apiRoutes);
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[ERROR] Unhandled error:', err?.message || err);
    console.error('[ERROR] Stack:', err?.stack);
    res.status(500).json({
      error: err?.message || 'Internal server error',
      stack: err?.stack ? err.stack.split('\n').slice(0, 6).join('\n') : 'no stack',
    });
  });

  console.log('[APP] createAppSync() done');
  return app;
}

export async function createApp() {
  await store.init();
  store.seed(...COLLECTIONS);

  const app = createAppSync();

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
