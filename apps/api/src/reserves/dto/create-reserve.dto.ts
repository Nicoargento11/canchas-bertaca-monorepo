import { ReserveType, Status } from '@prisma/client';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReserveDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty()
  @IsString()
  schedule: string;

  @IsNotEmpty()
  @IsNumber()
  court: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  reservationAmount?: number;

  @IsOptional()
  status?: Status;

  @IsOptional()
  @IsString()
  paymentUrl?: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  paymentToken?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  reserveType?: ReserveType;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
