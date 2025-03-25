-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceNoLights" INTEGER NOT NULL,
    "priceWithLights" INTEGER NOT NULL,
    "priceHolidayWithLights" INTEGER NOT NULL,
    "priceHolidayNoLights" INTEGER NOT NULL,
    "priceMidnight" INTEGER NOT NULL,
    "reservationAmount" INTEGER NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekHour" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "WeekHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekendHour" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "WeekendHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Court_name_key" ON "Court"("name");

-- AddForeignKey
ALTER TABLE "WeekHour" ADD CONSTRAINT "WeekHour_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekendHour" ADD CONSTRAINT "WeekendHour_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
