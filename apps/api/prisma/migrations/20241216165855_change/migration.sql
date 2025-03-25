/*
  Warnings:

  - You are about to drop the column `priceHolidayNoLights` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `priceHolidayWithLights` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `priceMidnight` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `priceNoLights` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `priceWithLights` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the `PaymentToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[PaymentToken]` on the table `Reserves` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `time` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "PaymentToken" DROP CONSTRAINT "PaymentToken_reserveId_fkey";

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "priceHolidayNoLights",
DROP COLUMN "priceHolidayWithLights",
DROP COLUMN "priceMidnight",
DROP COLUMN "priceNoLights",
DROP COLUMN "priceWithLights";

-- AlterTable
ALTER TABLE "Reserves" ADD COLUMN     "PaymentToken" TEXT;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "PaymentToken";

-- CreateTable
CREATE TABLE "Pricing" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reserves_PaymentToken_key" ON "Reserves"("PaymentToken");

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
