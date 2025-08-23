// src/cash-register/dto/create-cash-register.dto.ts
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCashRegisterDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  complexId: string;
}
