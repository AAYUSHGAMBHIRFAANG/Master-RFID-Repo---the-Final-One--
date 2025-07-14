// apps/backend/src/services/reportService.js
import createError from 'http-errors';
import { prisma } from './prisma.js';

/**
 * Fetch per-student attendance report for a section over a date range.
 *
 * @param {string|number} sectionIdRaw  – the Section.id to report on
 * @param {string|Date}   fromRaw       – start date (inclusive)
 * @param {string|Date}   toRaw         – end date (inclusive)
 * @returns {Promise<Array<{
 *   studentId: number,
 *   name: string,
 *   enrollmentNo: string,
 *   presentCount: number,
 *   absentCount: number,
 *   totalCount: number,
 *   percentage: number
 * }>>}
 */
export async function getReport(sectionIdRaw, fromRaw, toRaw) {
  // 1) Parse & validate inputs
  const sectionId = Number(sectionIdRaw);
  const fromDate  = new Date(fromRaw);
  const toDate    = new Date(toRaw);

  if (
    isNaN(sectionId) ||
    isNaN(fromDate.getTime()) ||
    isNaN(toDate.getTime()) ||
    fromDate > toDate
  ) {
    throw createError(400, 'Invalid sectionId or date range');
  }

  // Normalize to full days
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  // 2) Load all students in the section
  const students = await prisma.student.findMany({
    where: { sectionId },
    select: {
      id: true,
      name: true,
      enrollmentNo: true
    }
  });

  // 3) Count total closed sessions in the range for that section
  const totalCount = await prisma.classSession.count({
    where: {
      isClosed: true,
      startAt: { gte: fromDate, lte: toDate },
      subjectInst: { sectionId }       // joins via SubjectInstance → Section
    }
  });

  // 4) Tally presents per student via groupBy
  const presentGroups = await prisma.attendanceLog.groupBy({
    by: ['studentId'],
    where: {
      status: 'PRESENT',
      timestamp: { gte: fromDate, lte: toDate },
      session: {
        subjectInst: { sectionId }
      }
    },
    _count: { studentId: true }
  });

  // Map studentId → presentCount
  const presentMap = Object.fromEntries(
    presentGroups.map((g) => [g.studentId, g._count.studentId])
  );

  // 5) Build report rows
  const report = students.map((s) => {
    const presentCount = presentMap[s.id] || 0;
    const absentCount  = totalCount - presentCount;
    const percent =
      totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

    return {
      studentId:    s.id,
      name:         s.name,
      enrollmentNo: s.enrollmentNo,
      presentCount,
      absentCount,
      totalCount,
      percentage:   Math.round(percent * 100) / 100  // two decimals
    };
  });

  // 6) Sort by student name
  report.sort((a, b) => a.name.localeCompare(b.name));

  return report;
}
