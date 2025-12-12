/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Sale` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_organizationId_fkey";

-- DropIndex
DROP INDEX "Sale_organizationId_idx";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "organizationId";
