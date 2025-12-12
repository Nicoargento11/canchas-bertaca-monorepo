export class ProductSaleResponseDto {
  id: string;
  reserveId?: string;
  quantity: number;
  price: number;
  discount?: number;
  isGift: boolean;
  productId: string;
  saleId: string;
  complexId: string;
  createdAt: Date;
  updatedAt: Date;
}
