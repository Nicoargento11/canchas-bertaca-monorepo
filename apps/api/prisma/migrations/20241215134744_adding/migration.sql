/*
  Warnings:

  - You are about to drop the `WeekHour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeekendHour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WeekHour" DROP CONSTRAINT "WeekHour_courtId_fkey";

-- DropForeignKey
ALTER TABLE "WeekendHour" DROP CONSTRAINT "WeekendHour_courtId_fkey";

-- DropTable
DROP TABLE "WeekHour";

-- DropTable
DROP TABLE "WeekendHour";

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isWeekend" BOOLEAN NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
