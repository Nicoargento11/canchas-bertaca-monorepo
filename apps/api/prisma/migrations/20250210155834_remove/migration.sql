/*
  Warnings:

  - You are about to drop the `ScheduleBenefit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleRate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScheduleBenefit" DROP CONSTRAINT "ScheduleBenefit_benefitId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleBenefit" DROP CONSTRAINT "ScheduleBenefit_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleRate" DROP CONSTRAINT "ScheduleRate_rateId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleRate" DROP CONSTRAINT "ScheduleRate_scheduleId_fkey";

-- DropTable
DROP TABLE "ScheduleBenefit";

-- DropTable
DROP TABLE "ScheduleRate";

-- CreateTable
CREATE TABLE "_BenefitToSchedule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BenefitToSchedule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RateToSchedule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RateToSchedule_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BenefitToSchedule_B_index" ON "_BenefitToSchedule"("B");

-- CreateIndex
CREATE INDEX "_RateToSchedule_B_index" ON "_RateToSchedule"("B");

-- AddForeignKey
ALTER TABLE "_BenefitToSchedule" ADD CONSTRAINT "_BenefitToSchedule_A_fkey" FOREIGN KEY ("A") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToSchedule" ADD CONSTRAINT "_BenefitToSchedule_B_fkey" FOREIGN KEY ("B") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RateToSchedule" ADD CONSTRAINT "_RateToSchedule_A_fkey" FOREIGN KEY ("A") REFERENCES "Rate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RateToSchedule" ADD CONSTRAINT "_RateToSchedule_B_fkey" FOREIGN KEY ("B") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
