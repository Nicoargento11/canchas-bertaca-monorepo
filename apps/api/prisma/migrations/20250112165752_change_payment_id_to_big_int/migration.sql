/*
  Warnings:

  - The `paymentId` column on the `Reserves` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Reserves" DROP COLUMN "paymentId",
ADD COLUMN     "paymentId" BIGINT;
