/*
  Warnings:

  - A unique constraint covering the columns `[studentId,sessionId]` on the table `AttendanceLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AttendanceLog_studentId_sessionId_key" ON "AttendanceLog"("studentId", "sessionId");
