import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/index.js';
import { createContext } from './lib/context.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Allow local Vite dev server + same-origin (Docker / production)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4000'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lob-bff' });
});

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Serve the built React SPA when present (single-container / production mode).
// STATIC_DIR can be overridden; default is sibling "public" next to the compiled BFF.
const staticDir =
  process.env.STATIC_DIR ||
  path.resolve(__dirname, '../public') ||
  path.resolve(__dirname, '../../web/dist');

if (fs.existsSync(staticDir)) {
  console.log(`📦 Serving frontend from ${staticDir}`);
  app.use(express.static(staticDir, { index: false, maxAge: '1h' }));

  // SPA fallback — send index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/trpc') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.log('ℹ️  No static frontend found — API-only mode (use Vite in development)');
}

app.listen(PORT, () => {
  console.log(`🚀 LOB Dashboard listening on http://localhost:${PORT}`);
  console.log(`   tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`   Health:        http://localhost:${PORT}/health`);
  if (fs.existsSync(staticDir)) {
    console.log(`   UI:            http://localhost:${PORT}/`);
  }
  console.log(`   Dev tip: set localStorage.dev-role = executive|developer|operations`);
});
