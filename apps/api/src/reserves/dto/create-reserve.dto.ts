import { ReserveType, Status } from '@prisma/client';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReserveDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  @Matches(/^\d{2}:\d{2} - \d{2}:\d{2}$/)
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

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  expiresAt: Date;
}
