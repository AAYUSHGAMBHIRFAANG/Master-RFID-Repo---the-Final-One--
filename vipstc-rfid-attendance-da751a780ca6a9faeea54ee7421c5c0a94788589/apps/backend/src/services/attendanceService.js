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
    update: { status: 'PRESENT', timestamp: now, deviceId },
    create: { studentId, sessionId, status: 'PRESENT', timestamp: now, deviceId }
  });

  // Broadcast only the delta
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { name: true, enrollmentNo: true }
  });

  broadcast(sessionId, 'attendance:add', {
    studentId,
    name: student.name,
    enrol: student.enrollmentNo,
    time: now.getTime()
  });

  return log;
}

/**
 * Send the full attendance list for a session (present & absent).
 * Used on WS connect or session open.
 */
export async function broadcastSnapshot(sessionId) {
  // Prisma expects an Int, not a string
  const sid = Number(sessionId);
  if (isNaN(sid)) return;

  // Fetch the session with its section’s students
  const session = await prisma.classSession.findUnique({
    where: { id: sid },
    include: {
      subjectInst: { include: { section: { include: { students: true } } } }
    }
  });
  if (!session) return;

  const studentList = session.subjectInst.section.students;
  // Find all PRESENT logs by sid
  const logs = await prisma.attendanceLog.findMany({
    where: { sessionId: sid, status: 'PRESENT' },
    select: { studentId: true, timestamp: true }
  });
  const presentMap = Object.fromEntries(
    logs.map((l) => [l.studentId, l.timestamp.getTime()])
  );

  // Build array
  const snapshot = studentList.map((s) => ({
    studentId: s.id,
    name: s.name,
    enrol: s.enrollmentNo,
    status: presentMap[s.id] ? 'PRESENT' : 'ABSENT',
    time: presentMap[s.id] || null
  }));

  broadcast(sid, 'attendance:snapshot', snapshot);
}

/**
 * Override an existing attendance log’s status (manual correction)
 * and broadcast a manual-update event.
 *
 * @param {number|string} logId
 * @param {'PRESENT'|'ABSENT'} newStatus
 */
export async function overrideLog(logId, newStatus) {
  const id = Number(logId);
  if (isNaN(id)) {
    throw new Error('Invalid log ID');
  }
  if (!['PRESENT', 'ABSENT'].includes(newStatus)) {
    throw new Error('Invalid status for override');
  }

  const now = new Date();
  let log;
  try {
    log = await prisma.attendanceLog.update({
      where: { id },
      data: {
        status:       newStatus,
        manualOverride: true,
        timestamp:    now
      }
    });
  } catch (err) {
    // Prisma “record not found” error
    if (err.code === 'P2025') {
      throw createError(404, `Attendance log #${id} not found`);
    }
    throw err;
  }

  // Broadcast the manual change
  broadcast(log.sessionId, 'attendance:manual', {
    logId:     log.id,
    studentId: log.studentId,
    status:    log.status,
    time:      now.getTime(),
    manual:    true
  });

  return log;
}