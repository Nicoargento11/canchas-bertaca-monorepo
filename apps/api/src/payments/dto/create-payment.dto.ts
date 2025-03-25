import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsInt,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreatePaymentDto {
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
