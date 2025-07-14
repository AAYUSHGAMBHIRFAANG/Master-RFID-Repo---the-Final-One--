// apps/backend/src/app.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// --- Seed default Admin user for tests/auth.test.js ---
import bcrypt from 'bcrypt';
import { prisma } from './services/prisma.js';

await (async function seedAdmin() {
  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@vips-tc.ac.in';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  });
  if (!existing) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        email:        ADMIN_EMAIL,
        passwordHash: hash,
        role:         'ADMIN'
      }
    });
    console.log(`[seed] created default admin: ${ADMIN_EMAIL}`);
  }
})();

// --- Imports ---
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger, loggerConsole } from './middlewares/logger.js';
import { errorHandler }           from './middlewares/error.js';

import swaggerUi from 'swagger-ui-express';
import fs        from 'fs';
import path      from 'path';

import { healthRouter }     from './routes/health.js';
import { authRouter }       from './routes/auth.js';
import { deviceRouter }     from './routes/device.js';
import { sessionRouter }    from './routes/session.js';
import { scanRouter }       from './routes/scan.js';
import { attendanceRouter } from './routes/attendance.js';
import { reportRouter }     from './routes/report.js';

import { initWebSocket }    from './websocket.js';
import { scheduleAutoClose } from './tasks/autoClose.js';

// --- App Setup ---
const app = express();

// Load OpenAPI spec for Swagger UI
const specPath   = path.resolve('src/openapi.json');
const openapiSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

// Security & Logging
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET','POST','PATCH'] }));
app.use(loggerConsole);
app.use(logger);
app.use(express.json());

// --- Routes ---
app.use('/api/health',    healthRouter);
app.use('/api/auth',      authRouter);
app.use('/api/device',    deviceRouter);
app.use('/api/session',   sessionRouter);
app.use('/api/scan',      scanRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/report',    reportRouter);

// Swagger UI
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, { explorer: true })
);

// Error handler (must come last)
app.use(errorHandler);

// Monkey-patch listen → WebSocket init
const originalListen = app.listen.bind(app);
app.listen = (...args) => {
  const server = originalListen(...args);
  initWebSocket(server);
  return server;
};

// Start server if not in test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API 🚀  on :${PORT}`));
}

// Kick off cron jobs
if (process.env.NODE_ENV !== 'test') {
  scheduleAutoClose();
 }
// Export factory for tests
export function createApp() {
  return app;
}
export default createApp;
