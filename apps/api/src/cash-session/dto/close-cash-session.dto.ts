// src/cash-session/dto/close-cash-session.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CloseCashSessionDto {
  @IsNumber()
  finalAmount: number;

  @IsString()
  @IsOptional()
  observations?: string;
}
