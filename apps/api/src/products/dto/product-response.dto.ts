import { ProductCategory } from '@prisma/client';

export class ProductResponseDto {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  category: ProductCategory;
  stock: number;
  costPrice: number;
  salePrice: number;
  minStock: number;
  supplier?: string;
  isActive: boolean;
  complexId: string;
  createdAt: Date;
  updatedAt: Date;
}
