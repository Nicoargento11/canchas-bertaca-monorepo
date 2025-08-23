/*
  Warnings:

  - The values [NORMAL] on the enum `ReserveType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReserveType_new" AS ENUM ('MANUAL', 'FIJO', 'ONLINE', 'TORNEO', 'ESCUELA', 'EVENTO', 'OTRO');
ALTER TABLE "Reserve" ALTER COLUMN "reserveType" TYPE "ReserveType_new" USING ("reserveType"::text::"ReserveType_new");
ALTER TYPE "ReserveType" RENAME TO "ReserveType_old";
ALTER TYPE "ReserveType_new" RENAME TO "ReserveType";
DROP TYPE "ReserveType_old";
COMMIT;
