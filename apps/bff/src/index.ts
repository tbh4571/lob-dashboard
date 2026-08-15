import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/index.js';
import { createContext } from './lib/context.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

app.listen(PORT, () => {
  console.log(`🚀 BFF listening on http://localhost:${PORT}`);
  console.log(`   tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`   Dev tip: pass ?role=executive|developer|operations to simulate users`);
});
