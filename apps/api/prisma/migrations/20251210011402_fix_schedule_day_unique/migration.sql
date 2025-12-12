/*
  Warnings:

  - A unique constraint covering the columns `[dayOfWeek,complexId]` on the table `ScheduleDay` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ScheduleDay_dayOfWeek_key";

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDay_dayOfWeek_complexId_key" ON "ScheduleDay"("dayOfWeek", "complexId");
