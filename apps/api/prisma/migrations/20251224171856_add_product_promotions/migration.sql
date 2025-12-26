-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PromotionType" ADD VALUE 'PRODUCT_PERCENTAGE';
ALTER TYPE "PromotionType" ADD VALUE 'PRODUCT_FIXED_DISCOUNT';
ALTER TYPE "PromotionType" ADD VALUE 'PRODUCT_BUY_X_PAY_Y';
ALTER TYPE "PromotionType" ADD VALUE 'PRODUCT_FIXED_PRICE';

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "buyQuantity" INTEGER,
ADD COLUMN     "payQuantity" INTEGER,
ADD COLUMN     "targetProductId" TEXT;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
