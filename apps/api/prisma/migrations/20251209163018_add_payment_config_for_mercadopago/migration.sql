/*
  Warnings:

  - You are about to drop the column `mpAccessToken` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `mpIntegratorId` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `mpPublicKey` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `mpRefreshToken` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `mpTokenExpiresAt` on the `Complex` table. All the data in the column will be lost.
  - You are about to drop the column `mpUserId` on the `Complex` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Complex" DROP COLUMN "mpAccessToken",
DROP COLUMN "mpIntegratorId",
DROP COLUMN "mpPublicKey",
DROP COLUMN "mpRefreshToken",
DROP COLUMN "mpTokenExpiresAt",
DROP COLUMN "mpUserId";

-- CreateTable
CREATE TABLE "PaymentConfig" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "complexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentConfig_complexId_key" ON "PaymentConfig"("complexId");

-- AddForeignKey
ALTER TABLE "PaymentConfig" ADD CONSTRAINT "PaymentConfig_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
