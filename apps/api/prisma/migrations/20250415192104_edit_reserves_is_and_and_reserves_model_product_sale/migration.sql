/*
  Warnings:

  - The values [PURCHASE,SALE,ADJUSTMENT,LOSS,RETURN] on the enum `MovementType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CASH,TRANSFER,CREDIT_CARD,OTHER] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [BEVERAGE,FOOD,EQUIPMENT,OTHER] on the enum `ProductCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [RESERVATION,PRODUCT_SALE,SERVICE,EXPENSE,SOCCER_SCHOOL,EVENT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reservesId` on the `ProductSale` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MovementType_new" AS ENUM ('COMPRA', 'VENTA', 'AJUSTE', 'PERDIDA', 'DEVOLUCION');
ALTER TABLE "InventoryMovement" ALTER COLUMN "type" TYPE "MovementType_new" USING ("type"::text::"MovementType_new");
ALTER TYPE "MovementType" RENAME TO "MovementType_old";
ALTER TYPE "MovementType_new" RENAME TO "MovementType";
DROP TYPE "MovementType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('EFECTIVO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'MERCADOPAGO', 'OTRO');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProductCategory_new" AS ENUM ('BEBIDA', 'COMIDA', 'SNACK', 'EQUIPAMIENTO', 'OTRO');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "ProductCategory_new" USING ("category"::text::"ProductCategory_new");
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "ProductCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('RESERVA', 'VENTA_PRODUCTO', 'SERVICIO', 'GASTO', 'ESCUELA_FUTBOL', 'EVENTO');
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ProductSale" DROP CONSTRAINT "ProductSale_reservesId_fkey";

-- AlterTable
ALTER TABLE "ProductSale" DROP COLUMN "reservesId",
ADD COLUMN     "reserveId" TEXT;

-- DropEnum
DROP TYPE "PricingType";

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
