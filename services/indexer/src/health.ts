import express, { Express } from 'express';

export function createHealthServer(getLag: () => number): Express {
  const app = express();

  app.get('/health', (_req, res) => {
    const lag = getLag();
    res.json({
      status: 'ok',
      service: 'indexer',
      blockLag: lag,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
