// src/products/dto/create-product.dto.ts
import { ProductCategory } from '@prisma/client';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  category: ProductCategory;

  @IsNumber()
  stock: number;

  @IsNumber()
  costPrice: number;

  @IsNumber()
  salePrice: number;

  @IsNumber()
  minStock: number;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
