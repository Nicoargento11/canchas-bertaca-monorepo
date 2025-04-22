import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateInventoryMovementDto {
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;
}
