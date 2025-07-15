// apps/backend/src/services/sessionService.js

import { prisma } from '../services/prisma.js';
import createError from 'http-errors';

/**
 * Fetch all SubjectInstances assigned to a given faculty (teacher).
 * @param {number} facultyId
 * @returns {Promise<Array<{id:number, subject:{code:string,name:string}, section:{id:number,name:string, semester:{number:number, course:{name:string}}}}>>}
 */
export async function getTeacherSubjectInstances(facultyId) {
  return prisma.subjectInstance.findMany({
    where: { facultyId },
    select: {
      id: true,
      subject: {
        select: { code: true, name: true }
      },
      section: {
        select: {
          id: true,
          name: true,
          semester: {
            select: {
              number: true,
              course: { select: { name: true } }
            }
          }
        }
      }
    },
    orderBy: [
      { section: { id: 'asc' } },
      { subjectId: 'asc' }
    ]
  });
}


/**
 * Open (start) a new ClassSession for a teacher.
 * Automatically derives sectionId from the SubjectInstance.
 *
 * @param {number} facultyId   – The teacher.faculty.id
 * @param {number} id          – Either a SubjectInstance.id or legacy Section.id
 * @param {string} [startAtIso] – Optional ISO timestamp; defaults to now
 * @returns {Promise<import('@prisma/client').ClassSession>}
 * @throws {HttpError(400|404)} if no matching subject instance found
 */
export async function openSession(facultyId, id, startAtIso) {
  // 1) Try to interpret `id` as a SubjectInstance.id
  let si = await prisma.subjectInstance.findFirst({
    where: { id, facultyId },
    select: { id: true, sectionId: true }
  });

  // 2) If that fails, treat `id` as a legacy sectionId
  if (!si) {
    si = await prisma.subjectInstance.findFirst({
      where: { facultyId, sectionId: id },
      select: { id: true, sectionId: true }
    });
    if (!si) {
      throw createError(400,
        'No class assignment found for this teacher with the provided id'
      );
    }
  }

  // 3) Create the session—notice we no longer write sectionId directly
  return prisma.classSession.create({
    data: {
      teacherId:    facultyId,
      subjectInstId: si.id,
      startAt:      startAtIso ? new Date(startAtIso) : new Date()
    }
  });
}


/**
 * Attach a physical device to an open ClassSession.
 * Subsequent scans will be attributed to this device.
 *
 * @param {number} sessionId
 * @param {number} deviceId
 * @returns {Promise<import('@prisma/client').ClassSession>}
 */
export async function attachDevice(sessionId, deviceId) {
  return prisma.classSession.update({
    where: { id: sessionId },
    data: { deviceId }
  });
}


/**
 * Close a ClassSession, set its end time and isClosed flag,
 * and bulk‑mark ABSENT for any students in that section not scanned.
 *
 * @param {number} sessionId
 * @returns {Promise<import('@prisma/client').ClassSession>}
 * @throws {HttpError(404)} if session not found
 */
export async function closeSession(sessionId) {
  // 1) Load session + relation to figure out sectionId
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: {
      subjectInst: { select: { sectionId: true } }
    }
  });
  if (!session) {
    throw createError(404, 'Session not found');
  }
  if (session.isClosed) {
    // already closed? just return it
    return session;
  }

  // 2) Mark it closed
  const closed = await prisma.classSession.update({
    where: { id: sessionId },
    data: {
      endAt:    new Date(),
      isClosed: true
    }
  });

  const sectionId = session.subjectInst.sectionId;

  // 3) Bulk‑insert ABSENT logs for those never scanned
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "AttendanceLog"(
        "studentId", "sessionId", status, timestamp, "deviceId"
      )
      SELECT
        s.id,
        $1,
        'ABSENT',
        NOW(),
        $2
      FROM "Student" s
      WHERE s."sectionId" = $3
        AND NOT EXISTS (
          SELECT 1 FROM "AttendanceLog" al
          WHERE al."sessionId" = $1
            AND al."studentId" = s.id
        );
    `,
    sessionId,
    session.deviceId ?? null,
    sectionId
  );

  return closed;
}
