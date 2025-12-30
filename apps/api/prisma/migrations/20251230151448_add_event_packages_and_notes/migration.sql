-- AlterTable
ALTER TABLE "Reserve" ADD COLUMN     "eventPackageId" TEXT,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "EventPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courtCount" INTEGER,
    "courtType" TEXT,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "lightPrice" DOUBLE PRECISION NOT NULL,
    "includes" TEXT[],
    "allowExtras" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "complexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPackage_complexId_idx" ON "EventPackage"("complexId");

-- CreateIndex
CREATE INDEX "EventPackage_isActive_idx" ON "EventPackage"("isActive");

-- CreateIndex
CREATE INDEX "Reserve_eventPackageId_idx" ON "Reserve"("eventPackageId");

-- AddForeignKey
ALTER TABLE "EventPackage" ADD CONSTRAINT "EventPackage_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_eventPackageId_fkey" FOREIGN KEY ("eventPackageId") REFERENCES "EventPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
