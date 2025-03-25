/*
  Warnings:

  - You are about to alter the column `paymentId` on the `Reserves` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Reserves" ALTER COLUMN "paymentId" SET DATA TYPE INTEGER;
