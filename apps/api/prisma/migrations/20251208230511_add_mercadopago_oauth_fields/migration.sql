-- AlterTable
ALTER TABLE "Complex" ADD COLUMN     "mpRefreshToken" TEXT,
ADD COLUMN     "mpTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "mpUserId" TEXT;
