-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_reserveId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "reserveId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
