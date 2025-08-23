import { MovementType } from '@prisma/client';
import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreateInventoryMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsString()
  productId: string;

  @IsString()
  complexId: string;
}
