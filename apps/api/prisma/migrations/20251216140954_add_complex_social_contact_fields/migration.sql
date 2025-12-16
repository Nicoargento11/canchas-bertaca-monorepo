-- DropIndex
DROP INDEX "InventoryMovement_complexId_idx";

-- DropIndex
DROP INDEX "Notification_isRead_idx";

-- DropIndex
DROP INDEX "Notification_type_idx";

-- DropIndex
DROP INDEX "Organization_createdAt_idx";

-- DropIndex
DROP INDEX "Product_isActive_idx";

-- DropIndex
DROP INDEX "Product_stock_idx";

-- DropIndex
DROP INDEX "Reserve_complexId_idx";

-- DropIndex
DROP INDEX "Reserve_date_idx";

-- DropIndex
DROP INDEX "Reserve_status_idx";

-- DropIndex
DROP INDEX "Reserve_userId_idx";

-- DropIndex
DROP INDEX "Sale_complexId_idx";

-- DropIndex
DROP INDEX "Tournament_fixturePublished_idx";

-- DropIndex
DROP INDEX "Tournament_isOpen_idx";

-- AlterTable
ALTER TABLE "Complex" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "InventoryMovement_complexId_createdAt_idx" ON "InventoryMovement"("complexId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_complexId_createdAt_idx" ON "Payment"("complexId", "createdAt");

-- CreateIndex
CREATE INDEX "Reserve_complexId_date_idx" ON "Reserve"("complexId", "date");

-- CreateIndex
CREATE INDEX "Sale_complexId_createdAt_idx" ON "Sale"("complexId", "createdAt");

-- CreateIndex
CREATE INDEX "UnavailableDay_complexId_date_idx" ON "UnavailableDay"("complexId", "date");
