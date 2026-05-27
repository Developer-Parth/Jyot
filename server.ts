import { createApp } from './server/app';

const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  const PORT = parseInt(process.env.PORT || '3003', 10);

  const tryListen = async (port: number) => {
    const app = await createApp();

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${port}`);
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} in use, trying ${port + 1}...`);
        server.close();
        tryListen(port + 1);
      } else {
        console.error('Failed to start server', err);
        process.exit(1);
      }
    });
  };

  tryListen(PORT).catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}
