// apps/backend/src/routes/attendance.js
import { Router } from 'express';
import createError from 'http-errors';
import { verifyJWT, requireRole } from '../middlewares/auth.js';
import { asyncWrap } from '../middlewares/error.js';
import { overrideLog } from '../services/attendanceService.js';

export const attendanceRouter = Router();

/**
 * PATCH /api/attendance/:logId
 * Body: { status: 'PRESENT'|'ABSENT' }
 */
attendanceRouter.patch(
  '/:logId',
  verifyJWT,
  requireRole('ADMIN','TEACHER'),
  asyncWrap(async (req, res) => {
    const logId = req.params.logId;
    const { status } = req.body || {};

    if (!status) throw createError(400, '`status` is required');
    if (!['PRESENT', 'ABSENT'].includes(status)) {
      throw createError(400, '`status` must be PRESENT or ABSENT');
    }

    const updated = await overrideLog(logId, status);
    res.json({ log: updated });
  })
);
