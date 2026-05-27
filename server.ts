import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRoutes from './server/routes/index.js';
import './server/db/setup.js';

const isVercel = !!process.env.VERCEL;

export async function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));

  if (!isVercel) {
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

  if (process.env.NODE_ENV !== "production" && !isVercel) {
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

// Local dev: start listening. On Vercel: just export the app.
if (!isVercel) {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const tryPort = async (port: number): Promise<void> => {
    const app = await createApp();
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${port}`);
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} in use, trying ${port + 1}...`);
        server.close();
        tryPort(port + 1);
      } else {
        console.error('Failed to start server', err);
        process.exit(1);
      }
    });
  };
  tryPort(PORT).catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}
