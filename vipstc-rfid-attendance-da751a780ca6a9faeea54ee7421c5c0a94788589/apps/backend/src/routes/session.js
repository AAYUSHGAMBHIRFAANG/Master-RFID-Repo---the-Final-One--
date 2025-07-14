import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { verifyJWT, requireRole } from '../middlewares/auth.js';
import { asyncWrap } from '../middlewares/error.js';
import * as sessionSvc from '../services/sessionService.js';
import { broadcastSnapshot } from '../services/attendanceService.js';
export const sessionRouter = Router();

/* ---- POST /api/session/open ------------------------------------------ */
sessionRouter.post(
  '/open',
  verifyJWT,
  requireRole('TEACHER'),
  asyncWrap(async (req, res) => {
    const { sectionId } = req.body || {};
    if (!sectionId) return res.sendStatus(400);
        // req.user.sub = userId  ➜  find the matching faculty row
      const faculty = await prisma.faculty.findFirst({
    where: { userId: req.user.sub },
    select: { id: true }
  });
    if (!faculty) return res.status(400).json({ message: 'No faculty profile' });

    const session = await sessionSvc.openSession(faculty.id, sectionId);

    res.status(201).json({ sessionId: session.id });
    await broadcastSnapshot(session.id);
  })
);

/* ---- PATCH /api/session/close/:id ------------------------------------ */
sessionRouter.patch(
  '/close/:id',
  verifyJWT,
  asyncWrap(async (req, res) => {
    const sessionId = Number(req.params.id);
    const closed = await sessionSvc.closeSession(sessionId);
    await broadcastSnapshot(sessionId);
    res.json({ ok: true, endAt: closed.endAt });
  })
);
