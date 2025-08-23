import { MovementType } from '@prisma/client';
import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class UpdateInventoryMovementDto {
  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  complexId?: string;
}
