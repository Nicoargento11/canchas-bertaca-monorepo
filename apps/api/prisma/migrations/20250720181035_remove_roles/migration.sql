/*
  Warnings:

  - The values [MODERADOR,ADMINISTRADOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `numberCourts` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `documentNumber` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the `Benefit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FixedSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reserves` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BenefitToSchedule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[date,complexId,courtId]` on the table `UnavailableDay` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `complexId` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complexId` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complexId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complexId` to the `ProductSale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `ProductSale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductSale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScheduleDay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UnavailableDay` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SportName" AS ENUM ('FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11', 'PADEL', 'TENIS', 'BASKET', 'VOLEY', 'HOCKEY');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('CLUB', 'EMPRESA', 'MUNICIPALIDAD', 'PARTICULAR', 'OTRO');

-- CreateEnum
CREATE TYPE "TypePost" AS ENUM ('PLAYER_REQUEST', 'RIVAL_REQUEST');

-- CreateEnum
CREATE TYPE "MatchRound" AS ENUM ('OCTAVO_FINAL', 'CUARTO_FINAL', 'SEMI_FINAL', 'FINAL');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "MovementType" ADD VALUE 'REGALO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReserveType" ADD VALUE 'ONLINE';
ALTER TYPE "ReserveType" ADD VALUE 'TORNEO';
ALTER TYPE "ReserveType" ADD VALUE 'ESCUELA';
ALTER TYPE "ReserveType" ADD VALUE 'EVENTO';
ALTER TYPE "ReserveType" ADD VALUE 'OTRO';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ORGANIZACION_ADMIN', 'COMPLEJO_ADMIN', 'RECEPCION', 'USUARIO');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USUARIO';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Status" ADD VALUE 'CANCELADO';
ALTER TYPE "Status" ADD VALUE 'COMPLETADO';

-- DropForeignKey
ALTER TABLE "FixedSchedule" DROP CONSTRAINT "FixedSchedule_rateId_fkey";

-- DropForeignKey
ALTER TABLE "FixedSchedule" DROP CONSTRAINT "FixedSchedule_scheduleDayId_fkey";

-- DropForeignKey
ALTER TABLE "FixedSchedule" DROP CONSTRAINT "FixedSchedule_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSale" DROP CONSTRAINT "ProductSale_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "Reserves" DROP CONSTRAINT "Reserves_fixedScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "Reserves" DROP CONSTRAINT "Reserves_userId_fkey";

-- DropForeignKey
ALTER TABLE "_BenefitToSchedule" DROP CONSTRAINT "_BenefitToSchedule_A_fkey";

-- DropForeignKey
ALTER TABLE "_BenefitToSchedule" DROP CONSTRAINT "_BenefitToSchedule_B_fkey";

-- DropIndex
DROP INDEX "Court_name_key";

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "numberCourts",
ADD COLUMN     "characteristics" TEXT[],
ADD COLUMN     "complexId" TEXT NOT NULL,
ADD COLUMN     "courtNumber" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "sportTypeId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InventoryMovement" DROP COLUMN "documentNumber",
ADD COLUMN     "complexId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cashSessionId" TEXT,
ADD COLUMN     "complexId" TEXT,
ADD COLUMN     "tournamentRegistrationId" TEXT,
ADD COLUMN     "transactionType" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "complexId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductSale" ADD COLUMN     "complexId" TEXT NOT NULL,
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Rate" ADD COLUMN     "complexId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "complexId" TEXT,
ADD COLUMN     "courtId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sportTypeId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleDay" ADD COLUMN     "complexId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UnavailableDay" ADD COLUMN     "complexId" TEXT,
ADD COLUMN     "courtId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "complexId" TEXT,
ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "Benefit";

-- DropTable
DROP TABLE "FixedSchedule";

-- DropTable
DROP TABLE "Reserves";

-- DropTable
DROP TABLE "_BenefitToSchedule";

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "OrganizationType" NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complex" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "services" TEXT[],
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportType" (
    "id" TEXT NOT NULL,
    "name" "SportName" NOT NULL,
    "description" TEXT,
    "complexId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserve" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "schedule" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "reservationAmount" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDIENTE',
    "phone" TEXT NOT NULL,
    "clientName" TEXT,
    "reserveType" "ReserveType",
    "paymentUrl" TEXT,
    "paymentIdExt" TEXT,
    "paymentToken" TEXT,
    "courtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fixedReserveId" TEXT,
    "complexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Reserve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedReserve" (
    "id" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scheduleDayId" TEXT NOT NULL,
    "rateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedReserve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "type" "TypePost" NOT NULL,
    "teamName" TEXT,
    "playersNeeded" INTEGER,
    "contact" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dayPreference" TIMESTAMP(3)[],
    "timePreference" TEXT[],
    "userId" TEXT NOT NULL,
    "complexId" TEXT,
    "courtId" TEXT,
    "sportTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "relatedId" TEXT,
    "complexId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashRegister" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "complexId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashSession" (
    "id" TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3),
    "initialAmount" DOUBLE PRECISION NOT NULL,
    "finalAmount" DOUBLE PRECISION,
    "totalCash" DOUBLE PRECISION,
    "totalCard" DOUBLE PRECISION,
    "totalTransfers" DOUBLE PRECISION,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "observations" TEXT,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,
    "isOpen" BOOLEAN NOT NULL,
    "maxTeams" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "fixturePublished" BOOLEAN NOT NULL DEFAULT false,
    "sportTypeId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "winnerTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentRegistration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "paymentIdExt" TEXT,
    "paymentToken" TEXT NOT NULL,
    "paymentUrl" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "players" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "winnerTeamId" TEXT,
    "round" "MatchRound" NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_createdAt_idx" ON "Organization"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Complex_email_key" ON "Complex"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Complex_slug_key" ON "Complex"("slug");

-- CreateIndex
CREATE INDEX "Complex_organizationId_idx" ON "Complex"("organizationId");

-- CreateIndex
CREATE INDEX "Complex_slug_idx" ON "Complex"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Reserve_paymentToken_key" ON "Reserve"("paymentToken");

-- CreateIndex
CREATE INDEX "Reserve_courtId_idx" ON "Reserve"("courtId");

-- CreateIndex
CREATE INDEX "Reserve_userId_date_idx" ON "Reserve"("userId", "date");

-- CreateIndex
CREATE INDEX "Reserve_userId_idx" ON "Reserve"("userId");

-- CreateIndex
CREATE INDEX "Reserve_fixedReserveId_idx" ON "Reserve"("fixedReserveId");

-- CreateIndex
CREATE INDEX "Reserve_complexId_idx" ON "Reserve"("complexId");

-- CreateIndex
CREATE INDEX "Reserve_date_idx" ON "Reserve"("date");

-- CreateIndex
CREATE INDEX "Reserve_status_idx" ON "Reserve"("status");

-- CreateIndex
CREATE INDEX "FixedReserve_scheduleDayId_idx" ON "FixedReserve"("scheduleDayId");

-- CreateIndex
CREATE INDEX "FixedReserve_rateId_idx" ON "FixedReserve"("rateId");

-- CreateIndex
CREATE INDEX "FixedReserve_userId_idx" ON "FixedReserve"("userId");

-- CreateIndex
CREATE INDEX "FixedReserve_courtId_idx" ON "FixedReserve"("courtId");

-- CreateIndex
CREATE INDEX "FixedReserve_complexId_idx" ON "FixedReserve"("complexId");

-- CreateIndex
CREATE INDEX "FixedReserve_scheduleDayId_courtId_idx" ON "FixedReserve"("scheduleDayId", "courtId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_sportTypeId_idx" ON "Post"("sportTypeId");

-- CreateIndex
CREATE INDEX "Post_complexId_idx" ON "Post"("complexId");

-- CreateIndex
CREATE INDEX "Post_courtId_idx" ON "Post"("courtId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_complexId_idx" ON "Notification"("complexId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "CashSession_cashRegisterId_idx" ON "CashSession"("cashRegisterId");

-- CreateIndex
CREATE INDEX "CashSession_status_idx" ON "CashSession"("status");

-- CreateIndex
CREATE INDEX "Tournament_sportTypeId_idx" ON "Tournament"("sportTypeId");

-- CreateIndex
CREATE INDEX "Tournament_complexId_idx" ON "Tournament"("complexId");

-- CreateIndex
CREATE INDEX "Tournament_winnerTeamId_idx" ON "Tournament"("winnerTeamId");

-- CreateIndex
CREATE INDEX "Tournament_isOpen_idx" ON "Tournament"("isOpen");

-- CreateIndex
CREATE INDEX "Tournament_fixturePublished_idx" ON "Tournament"("fixturePublished");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRegistration_paymentToken_key" ON "TournamentRegistration"("paymentToken");

-- CreateIndex
CREATE INDEX "TournamentRegistration_tournamentId_idx" ON "TournamentRegistration"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentRegistration_teamId_idx" ON "TournamentRegistration"("teamId");

-- CreateIndex
CREATE INDEX "TournamentRegistration_paymentId_idx" ON "TournamentRegistration"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRegistration_tournamentId_teamId_key" ON "TournamentRegistration"("tournamentId", "teamId");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "Match_winnerTeamId_idx" ON "Match"("winnerTeamId");

-- CreateIndex
CREATE INDEX "Match_round_idx" ON "Match"("round");

-- CreateIndex
CREATE INDEX "Match_scheduledAt_idx" ON "Match"("scheduledAt");

-- CreateIndex
CREATE INDEX "Court_complexId_idx" ON "Court"("complexId");

-- CreateIndex
CREATE INDEX "Court_sportTypeId_idx" ON "Court"("sportTypeId");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement"("productId");

-- CreateIndex
CREATE INDEX "InventoryMovement_complexId_idx" ON "InventoryMovement"("complexId");

-- CreateIndex
CREATE INDEX "Payment_reserveId_idx" ON "Payment"("reserveId");

-- CreateIndex
CREATE INDEX "Payment_tournamentRegistrationId_idx" ON "Payment"("tournamentRegistrationId");

-- CreateIndex
CREATE INDEX "Product_complexId_idx" ON "Product"("complexId");

-- CreateIndex
CREATE INDEX "Product_stock_idx" ON "Product"("stock");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "ProductSale_productId_idx" ON "ProductSale"("productId");

-- CreateIndex
CREATE INDEX "ProductSale_complexId_idx" ON "ProductSale"("complexId");

-- CreateIndex
CREATE INDEX "ProductSale_paymentId_idx" ON "ProductSale"("paymentId");

-- CreateIndex
CREATE INDEX "Rate_complexId_idx" ON "Rate"("complexId");

-- CreateIndex
CREATE INDEX "Schedule_scheduleDayId_idx" ON "Schedule"("scheduleDayId");

-- CreateIndex
CREATE INDEX "Schedule_complexId_idx" ON "Schedule"("complexId");

-- CreateIndex
CREATE INDEX "Schedule_courtId_idx" ON "Schedule"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "UnavailableDay_date_complexId_courtId_key" ON "UnavailableDay"("date", "complexId", "courtId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_complexId_idx" ON "User"("complexId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complex" ADD CONSTRAINT "Complex_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportType" ADD CONSTRAINT "SportType_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_sportTypeId_fkey" FOREIGN KEY ("sportTypeId") REFERENCES "SportType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_sportTypeId_fkey" FOREIGN KEY ("sportTypeId") REFERENCES "SportType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDay" ADD CONSTRAINT "ScheduleDay_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_fixedReserveId_fkey" FOREIGN KEY ("fixedReserveId") REFERENCES "FixedReserve"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReserve" ADD CONSTRAINT "FixedReserve_scheduleDayId_fkey" FOREIGN KEY ("scheduleDayId") REFERENCES "ScheduleDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReserve" ADD CONSTRAINT "FixedReserve_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "Rate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReserve" ADD CONSTRAINT "FixedReserve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReserve" ADD CONSTRAINT "FixedReserve_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReserve" ADD CONSTRAINT "FixedReserve_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_sportTypeId_fkey" FOREIGN KEY ("sportTypeId") REFERENCES "SportType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tournamentRegistrationId_fkey" FOREIGN KEY ("tournamentRegistrationId") REFERENCES "TournamentRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnavailableDay" ADD CONSTRAINT "UnavailableDay_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnavailableDay" ADD CONSTRAINT "UnavailableDay_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_sportTypeId_fkey" FOREIGN KEY ("sportTypeId") REFERENCES "SportType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerTeamId_fkey" FOREIGN KEY ("winnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
