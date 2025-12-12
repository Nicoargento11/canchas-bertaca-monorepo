-- AlterTable
ALTER TABLE "CashSession" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "CashSession_userId_idx" ON "CashSession"("userId");

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
