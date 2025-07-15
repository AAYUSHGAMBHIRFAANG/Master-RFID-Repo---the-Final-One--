// apps/backend/src/routes/session.js
import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { verifyJWT, requireRole } from '../middlewares/auth.js';
import { asyncWrap } from '../middlewares/error.js';
import {
  getTeacherSubjectInstances,
  openSession,
  closeSession
} from '../services/sessionService.js';
import { broadcastSnapshot } from '../services/attendanceService.js';

export const sessionRouter = Router();

/* ───────────────── GET /api/session/mine/subjects ────────────── */
sessionRouter.get(
  '/mine/subjects',
  verifyJWT,
  requireRole('TEACHER'),
  asyncWrap(async (req, res) => {
    const faculty = await prisma.faculty.findFirst({
      where: { userId: req.user.sub },
      select: { id: true }
    });
    if (!faculty) return res.status(400).json({ message: 'No faculty profile' });

    const list = await getTeacherSubjectInstances(faculty.id);
    res.json(list);
  })
);

/* ───────────────── POST /api/session/open ───────────────────────
   Body:
   { subjectInstId?, sectionId?, startAt? }
   – Accepts either identifier for legacy clients                */
sessionRouter.post(
  '/open',
  verifyJWT,
  requireRole('TEACHER'),
  asyncWrap(async (req, res) => {
    const { subjectInstId, sectionId, startAt } = req.body || {};

    if (!subjectInstId && !sectionId)
      return res.status(400).json({ message: 'subjectInstId or sectionId required' });

    const faculty = await prisma.faculty.findFirst({
      where: { userId: req.user.sub },
      select: { id: true }
    });
    if (!faculty) return res.status(400).json({ message: 'No faculty profile' });

    // openSession auto‑detects whether id is SubjectInstance or Section
    const session = await openSession(
      faculty.id,
      subjectInstId ?? sectionId,
      startAt
    );

    res.status(201).json({ sessionId: session.id });
    await broadcastSnapshot(session.id);     // push fresh table to waiting UI
  })
);

/* ───────────────── PATCH /api/session/close/:id ────────────────
   Teacher can close only his/her own session; ADMIN can close any */
sessionRouter.patch(
  '/close/:id',
  verifyJWT,
  asyncWrap(async (req, res) => {
    const sessionId = Number(req.params.id);

    if (req.user.role === 'TEACHER') {
      const owns = await prisma.classSession.count({
        where: { id: sessionId, teacher: { userId: req.user.sub } }
      });
      if (!owns) return res.status(403).json({ message: 'forbidden' });
    }

    const closed = await closeSession(sessionId);
    res.json({ ok: true, endAt: closed.endAt });
  })
);
