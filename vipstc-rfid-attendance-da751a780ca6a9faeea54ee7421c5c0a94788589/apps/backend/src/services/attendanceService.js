// apps/backend/src/services/attendanceService.js
import { prisma } from './prisma.js';
import { broadcast } from '../websocket.js';
import createError from 'http-errors';

/** 
 * Upsert a single attendance log and broadcast the new entry.
 */
export async function recordScan({ sessionId, studentId, deviceId }) {
  const now = new Date();
  const log = await prisma.attendanceLog.upsert({
    where: { studentId_sessionId: { studentId, sessionId } },
    update: {
      status:       'PRESENT',
      timestamp:    now,
      deviceId
    },
    create: {
      studentId,
      sessionId,
      status:    'PRESENT',
      timestamp: now,
      deviceId
    }
  });

  // Fetch the student details
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { name: true, enrollmentNo: true }
  });

  // Broadcast only the delta
  broadcast(sessionId, 'attendance:add', {
    id:        log.id,
    student:   { name: student.name, enrollmentNo: student.enrollmentNo },
    timestamp: now.toISOString(),
    status:    log.status
  });

  return log;
}

/**
 * Send the full attendance list for a session (present & absent).
 * Used on WS connect or session open.
 */
export async function broadcastSnapshot(sessionId) {
  const sid = Number(sessionId);
  if (isNaN(sid)) return;

  // Load the session along with its section→students
  const session = await prisma.classSession.findUnique({
    where: { id: sid },
    include: {
      subjectInst: {
        include: { section: { include: { students: true } } }
      }
    }
  });
  if (!session) return;

  // Build a map of PRESENT timestamps
  const logs = await prisma.attendanceLog.findMany({
    where: { sessionId: sid },
    select: {
      id:          true,
      studentId:   true,
      timestamp:   true,
      status:      true
    }
  });
  const presentMap = Object.fromEntries(
    logs.map((l) => [l.studentId, l])
  );

  // Assemble the full snapshot
  const snapshot = session.subjectInst.section.students.map((s) => {
    const log = presentMap[s.id];
    return {
      id:        log?.id ?? 0,
      student:   { name: s.name, enrollmentNo: s.enrollmentNo },
      timestamp: log ? log.timestamp.toISOString() : null,
      status:    log?.status ?? 'ABSENT'
    };
  });

  // Broadcast the snapshot
  broadcast(sid, 'attendance:snapshot', snapshot);
}
