import express from "express";
import path from "path";
import apiRoutes from './routes/index';
import './db/setup';

export function createAppSync() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));

  if (!process.env.VERCEL) {
    app.use((req, _res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

  app.use('/api', apiRoutes);
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  return app;
}

export async function createApp() {
  const app = createAppSync();

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
