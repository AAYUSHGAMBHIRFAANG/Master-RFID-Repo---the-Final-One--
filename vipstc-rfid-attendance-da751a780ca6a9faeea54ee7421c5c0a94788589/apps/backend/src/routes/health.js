// apps/backend/src/routes/health.js
import { Router } from 'express';
import { prisma } from '../services/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const start = Date.now();
  let dbHealthy = false;

  try {
    // simple query to test DB
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch (err) {
    dbHealthy = false;
  }

  const latency = Date.now() - start;
  res.json({
    status:   dbHealthy ? 'ok' : 'error',
    db:       dbHealthy ? 'connected' : 'down',
    latency,
    uptime:   process.uptime(),           // seconds
    env:      process.env.NODE_ENV || 'undefined'
  });
});
