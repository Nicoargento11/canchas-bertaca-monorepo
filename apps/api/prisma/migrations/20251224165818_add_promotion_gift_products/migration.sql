-- CreateTable
CREATE TABLE "PromotionGiftProduct" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionGiftProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionGiftProduct_promotionId_idx" ON "PromotionGiftProduct"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionGiftProduct_productId_idx" ON "PromotionGiftProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionGiftProduct_promotionId_productId_key" ON "PromotionGiftProduct"("promotionId", "productId");

-- AddForeignKey
ALTER TABLE "PromotionGiftProduct" ADD CONSTRAINT "PromotionGiftProduct_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionGiftProduct" ADD CONSTRAINT "PromotionGiftProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
