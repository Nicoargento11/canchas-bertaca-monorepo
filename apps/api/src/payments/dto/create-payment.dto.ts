import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsInt,
  IsPhoneNumber,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreatePaymentOnlineDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  @IsNotEmpty()
  schedule: string;

  @IsInt()
  @IsNotEmpty()
  court: number;

  @IsInt()
  price: number;

  @IsInt()
  reservationAmount: number;

  @IsPhoneNumber('AR') // Cambiar 'AR' al código de país si es necesario
  phone: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsBoolean()
  @IsNotEmpty()
  isPartial: boolean;

  @IsNotEmpty()
  reserveId: string;
}
