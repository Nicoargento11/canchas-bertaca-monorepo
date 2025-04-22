/*
  Warnings:

  - You are about to drop the column `reservationAmount` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `receipt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `court` on the `ProductSale` table. All the data in the column will be lost.
  - You are about to drop the column `reserveId` on the `ProductSale` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `ProductSale` table. All the data in the column will be lost.
  - You are about to drop the `DailySummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pricing` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `numberCourts` on table `Court` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FinancialTransaction" DROP CONSTRAINT "FinancialTransaction_dailySummaryId_fkey";

-- DropForeignKey
ALTER TABLE "FinancialTransaction" DROP CONSTRAINT "FinancialTransaction_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "Pricing" DROP CONSTRAINT "Pricing_courtId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSale" DROP CONSTRAINT "ProductSale_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSale" DROP CONSTRAINT "ProductSale_transactionId_fkey";

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "reservationAmount",
ALTER COLUMN "numberCourts" SET NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "receipt",
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductSale" DROP COLUMN "court",
DROP COLUMN "reserveId",
DROP COLUMN "transactionId",
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reservesId" TEXT;

-- DropTable
DROP TABLE "DailySummary";

-- DropTable
DROP TABLE "FinancialTransaction";

-- DropTable
DROP TABLE "Pricing";

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_reservesId_fkey" FOREIGN KEY ("reservesId") REFERENCES "Reserves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
