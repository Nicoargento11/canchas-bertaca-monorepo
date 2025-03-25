-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APROBADO', 'PENDIENTE', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "ReserveType" AS ENUM ('NORMAL', 'FIJO');

-- CreateTable
CREATE TABLE "Reserves" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "schedule" TEXT NOT NULL,
    "court" INTEGER NOT NULL,
    "price" INTEGER,
    "reservationAmount" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'PENDIENTE',
    "paymentUrl" TEXT,
    "paymentId" BIGINT,
    "phone" TEXT,
    "clientName" TEXT,
    "reserveType" "ReserveType",
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "court" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "reserveId" TEXT NOT NULL,

    CONSTRAINT "PaymentToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentToken_token_key" ON "PaymentToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentToken_reserveId_key" ON "PaymentToken"("reserveId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentToken_email_token_key" ON "PaymentToken"("email", "token");

-- AddForeignKey
ALTER TABLE "Reserves" ADD CONSTRAINT "Reserves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentToken" ADD CONSTRAINT "PaymentToken_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
