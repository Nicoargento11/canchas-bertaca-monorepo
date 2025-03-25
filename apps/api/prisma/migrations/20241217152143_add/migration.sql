/*
  Warnings:

  - Changed the type of `type` on the `Pricing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('NoLights', 'WithLights', 'HolidayLights', 'HolidayNoLights');

-- AlterTable
ALTER TABLE "Pricing" DROP COLUMN "type",
ADD COLUMN     "type" "PricingType" NOT NULL;
