// src/cash-session/dto/create-cash-session.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCashSessionDto {
  @IsString()
  @IsNotEmpty()
  cashRegisterId: string;

  // @IsString()
  // @IsNotEmpty()
  // userId: string;

  @IsNumber()
  @IsNotEmpty()
  initialAmount: number;
}
