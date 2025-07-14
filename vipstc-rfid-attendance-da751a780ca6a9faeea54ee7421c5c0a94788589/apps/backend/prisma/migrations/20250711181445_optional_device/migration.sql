-- DropForeignKey
ALTER TABLE "ClassSession" DROP CONSTRAINT "ClassSession_deviceId_fkey";

-- AlterTable
ALTER TABLE "ClassSession" ALTER COLUMN "deviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
