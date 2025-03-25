/*
  Warnings:

  - Added the required column `court` to the `FixedSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FixedSchedule" ADD COLUMN     "court" INTEGER NOT NULL;
