/*
  Warnings:

  - Made the column `userId` on table `CashSession` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CashSession" DROP CONSTRAINT "CashSession_userId_fkey";

-- AlterTable
ALTER TABLE "CashSession" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
