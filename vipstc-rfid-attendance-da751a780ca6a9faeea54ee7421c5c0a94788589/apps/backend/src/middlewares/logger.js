import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Log format:  [2025-07-11T09:13:14.012Z] 200 GET /api/health 3 ms
const format =
  '[:date[iso]] :status :method :url :response-time ms';

// Write to console **and** rotating file (logs/app.log)
const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export const logger = morgan(format, {
  stream: fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' })
});

// Also print to stdout
export const loggerConsole = morgan(format);
