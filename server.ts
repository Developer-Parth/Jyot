import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRoutes from './server/routes/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use increased limit to allow base64 image uploads
  app.use(express.json({ limit: "50mb" }));

  // Basic request logging (helps diagnose socket resets)
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Backend Routes
  app.use('/api', apiRoutes);

  // Health check
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Error handler (prevents connection resets without response)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
