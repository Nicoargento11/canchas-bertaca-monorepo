/*
  Warnings:

  - You are about to drop the column `courtId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `isWeekend` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleDayId` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_courtId_fkey";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "courtId",
DROP COLUMN "isWeekend",
DROP COLUMN "time",
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "scheduleDayId" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ScheduleDay" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,

    CONSTRAINT "ScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT,
    "discount" INTEGER NOT NULL,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleBenefit" (
    "scheduleId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,

    CONSTRAINT "ScheduleBenefit_pkey" PRIMARY KEY ("scheduleId","benefitId")
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "reservationAmount" INTEGER NOT NULL,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleRate" (
    "rateId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "ScheduleRate_pkey" PRIMARY KEY ("rateId","scheduleId")
);

-- CreateTable
CREATE TABLE "UnavailableDay" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "UnavailableDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDay_dayOfWeek_key" ON "ScheduleDay"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "UnavailableDay_date_key" ON "UnavailableDay"("date");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_scheduleDayId_fkey" FOREIGN KEY ("scheduleDayId") REFERENCES "ScheduleDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleBenefit" ADD CONSTRAINT "ScheduleBenefit_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleBenefit" ADD CONSTRAINT "ScheduleBenefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRate" ADD CONSTRAINT "ScheduleRate_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "Rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRate" ADD CONSTRAINT "ScheduleRate_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
