/*
  Warnings:

  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE_DISCOUNT', 'FIXED_AMOUNT_DISCOUNT', 'FIXED_PRICE', 'GIFT_PRODUCT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RESERVATION', 'PAYMENT', 'SYSTEM', 'PROMOTION', 'REMINDER');

-- DropIndex
DROP INDEX "UnavailableDay_date_key";

-- AlterTable
ALTER TABLE "FixedReserve" ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "ProductSale" ADD COLUMN     "promotionId" TEXT;

-- AlterTable
ALTER TABLE "Reserve" ADD COLUMN     "promotionId" TEXT;

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "daysOfWeek" INTEGER[],
    "startTime" TEXT,
    "endTime" TEXT,
    "complexId" TEXT NOT NULL,
    "sportTypeId" TEXT,
    "courtId" TEXT,
    "type" "PromotionType" NOT NULL,
    "value" DOUBLE PRECISION,
    "giftProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_sportTypeId_fkey" FOREIGN KEY ("sportTypeId") REFERENCES "SportType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_giftProductId_fkey" FOREIGN KEY ("giftProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReserve" ADD CONSTRAINT "FixedReserve_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
