console.log('[BOOT] api/index.ts loaded');

import express from 'express';
import { createAppSync } from './app.js';

let app: any;
try {
  console.log('[BOOT] api/index.ts calling createAppSync()');
  app = createAppSync();
  console.log('[BOOT] api/index.ts createAppSync() succeeded');
} catch (err: any) {
  console.error('[FATAL] api/index.ts createAppSync() failed:', err?.message || err);
  console.error('[FATAL] stack:', err?.stack);

  app = express();
  app.use('*', (_req: any, res: any) => {
    res.status(500).json({
      error: 'App initialization failed',
      message: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 8).join('\n'),
    });
  });
}

export default app;
