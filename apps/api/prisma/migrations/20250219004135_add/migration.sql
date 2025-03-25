-- AlterTable
ALTER TABLE "Reserves" ADD COLUMN     "fixedScheduleId" TEXT;

-- CreateTable
CREATE TABLE "FixedSchedule" (
    "id" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scheduleDayId" TEXT NOT NULL,
    "rateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reserves" ADD CONSTRAINT "Reserves_fixedScheduleId_fkey" FOREIGN KEY ("fixedScheduleId") REFERENCES "FixedSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedSchedule" ADD CONSTRAINT "FixedSchedule_scheduleDayId_fkey" FOREIGN KEY ("scheduleDayId") REFERENCES "ScheduleDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedSchedule" ADD CONSTRAINT "FixedSchedule_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "Rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
