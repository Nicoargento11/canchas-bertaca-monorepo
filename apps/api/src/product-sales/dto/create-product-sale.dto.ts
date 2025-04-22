import {
  IsInt,
  IsPositive,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductSaleDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  reserveId?: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsBoolean()
  @IsOptional()
  isGift?: boolean;
}
