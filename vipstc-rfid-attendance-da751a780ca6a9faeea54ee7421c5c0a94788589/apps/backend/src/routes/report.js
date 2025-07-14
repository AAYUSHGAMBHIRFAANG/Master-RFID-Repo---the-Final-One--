// apps/backend/src/routes/report.js
import { Router } from 'express';
import ExcelJS from 'exceljs';
import createError from 'http-errors';

import { verifyJWT, requireRole } from '../middlewares/auth.js';
import { asyncWrap } from '../middlewares/error.js';
import { getReport } from '../services/reportService.js';

const reportRouter = Router();

/**
 * GET /api/report/:sectionId
 * Query params: from, to (YYYY-MM-DD)
 * Returns JSON array of attendance rows.
 */
reportRouter.get(
  '/:sectionId',
  verifyJWT,
  requireRole('TEACHER'),
  asyncWrap(async (req, res) => {
    const { sectionId } = req.params;
    const { from, to } = req.query;
    if (!from || !to) {
      throw createError(400, '`from` and `to` query parameters are required');
    }
    const report = await getReport(sectionId, from, to);
    res.json({ report });
  })
);

/**
 * GET /api/report/:sectionId/export.xlsx
 * Query params: from, to
 * Streams down an Excel file.
 */
reportRouter.get(
  '/:sectionId/export.xlsx',
  verifyJWT,
  requireRole('TEACHER'),
  asyncWrap(async (req, res) => {
    const { sectionId } = req.params;
    const { from, to } = req.query;
    if (!from || !to) {
      throw createError(400, '`from` and `to` query parameters are required');
    }

    const report = await getReport(sectionId, from, to);

    // Build workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'S. No.',        key: 'sno',          width: 6  },
      { header: 'Name',          key: 'name',         width: 30 },
      { header: 'Enrollment No.',key: 'enrollmentNo', width: 20 },
      { header: 'Present',       key: 'presentCount', width: 10 },
      { header: 'Absent',        key: 'absentCount',  width: 10 },
      { header: 'Total',         key: 'totalCount',   width: 10 },
      { header: '%',             key: 'percentage',   width: 8  }
    ];

    report.forEach((row, idx) => {
      sheet.addRow({
        sno:           idx + 1,
        name:          row.name,
        enrollmentNo:  row.enrollmentNo,
        presentCount:  row.presentCount,
        absentCount:   row.absentCount,
        totalCount:    row.totalCount,
        percentage:    row.percentage
      });
    });

    // Set headers and stream
    const filename = `attendance_${sectionId}_${from}_${to}.xlsx`;
    res
      .status(200)
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      });

    await workbook.xlsx.write(res);
    res.end();
  })
);

export { reportRouter };
