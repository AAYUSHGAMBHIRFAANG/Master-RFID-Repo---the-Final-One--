// apps/backend/src/tasks/autoClose.js
import cron from 'node-cron';
import { prisma } from '../services/prisma.js';
import * as sessionSvc from '../services/sessionService.js';

/**
 * Schedule a daily job at 23:59 server time to auto-close any
 * sessions left open (e.g. teacher forgot to hit “End”).
 */
export function scheduleAutoClose() {
  // ┌───────────── minute (0 - 59)
  // │ ┌───────────── hour (0 - 23)
  // │ │ ┌───────────── day of month (1 - 31)
  // │ │ │ ┌───────────── month (1 - 12)
  // │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
  // │ │ │ │ │
  // * * * * *
  cron.schedule('59 23 * * *', async () => {
    console.log('[cron] Auto-closing stale sessions at', new Date().toISOString());

    // Find all sessions still open
    const openSessions = await prisma.classSession.findMany({
      where: { isClosed: false }
    });

    for (const sess of openSessions) {
      try {
        await sessionSvc.closeSession(sess.id);
        console.log('[cron] Closed session', sess.id);
      } catch (err) {
        console.error('[cron] Failed to close session', sess.id, err);
      }
    }
  }, {
    scheduled: true,
    timezone: 'Etc/UTC'  // adjust if you want IST or server local timezone
  });
}
