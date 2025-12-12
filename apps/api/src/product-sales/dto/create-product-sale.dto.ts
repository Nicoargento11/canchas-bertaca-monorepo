import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductSaleDto {
  @IsString()
  @IsOptional()
  reserveId?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsBoolean()
  @IsOptional()
  isGift?: boolean;

  @IsString()
  productId: string;

  @IsString()
  saleId: string;

  @IsString()
  complexId: string;
}
