import { ProductCategory } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  costPrice: number;

  @IsNumber()
  salePrice: number;

  @IsNumber()
  stock?: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  complexId: string;
}
