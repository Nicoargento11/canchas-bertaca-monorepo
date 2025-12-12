/*
  Warnings:

  - You are about to drop the column `paymentId` on the `ProductSale` table. All the data in the column will be lost.
  - Added the required column `saleId` to the `ProductSale` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductSale" DROP CONSTRAINT "ProductSale_paymentId_fkey";

-- DropIndex
DROP INDEX "ProductSale_paymentId_idx";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "saleId" TEXT;

-- AlterTable
ALTER TABLE "ProductSale" DROP COLUMN "paymentId",
ADD COLUMN     "saleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "complexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_complexId_idx" ON "Sale"("complexId");

-- CreateIndex
CREATE INDEX "Payment_saleId_idx" ON "Payment"("saleId");

-- CreateIndex
CREATE INDEX "ProductSale_saleId_idx" ON "ProductSale"("saleId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
