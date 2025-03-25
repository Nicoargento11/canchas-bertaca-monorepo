/*
  Warnings:

  - You are about to drop the column `PaymentToken` on the `Reserves` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentToken]` on the table `Reserves` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Reserves_PaymentToken_key";

-- AlterTable
ALTER TABLE "Reserves" DROP COLUMN "PaymentToken",
ADD COLUMN     "paymentToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reserves_paymentToken_key" ON "Reserves"("paymentToken");
