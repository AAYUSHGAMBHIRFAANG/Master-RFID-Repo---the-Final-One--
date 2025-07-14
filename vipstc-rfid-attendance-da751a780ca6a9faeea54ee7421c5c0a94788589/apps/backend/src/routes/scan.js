import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { verifyJWT } from '../middlewares/auth.js';
import { asyncWrap } from '../middlewares/error.js';
import { isHexUid } from '../utils/validators.js';
import { verifyToken } from '../utils/jwt.js';
import { broadcast } from '../websocket.js';
import { recordScan, broadcastSnapshot } from '../services/attendanceService.js';

export const scanRouter = Router();

/* ---- POST /api/scan -------------------------------------------------- */
scanRouter.post(
  '/',
  verifyJWT,
  asyncWrap(async (req, res) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    const { dev: deviceId } = verifyToken(token);

    const { uid, sessionId } = req.body || {};
    if (!isHexUid(uid) || !sessionId) return res.sendStatus(400);

    const student = await prisma.student.findUnique({ where: { rfidUid: uid } });
    if (!student) return res.sendStatus(404);

    await recordScan({ sessionId, studentId: student.id, deviceId });

    res.sendStatus(204);
  })
);
