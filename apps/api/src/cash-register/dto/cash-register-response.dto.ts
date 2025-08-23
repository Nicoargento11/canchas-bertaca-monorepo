// src/cash-register/dto/cash-register-response.dto.ts
import { Exclude } from 'class-transformer';

export class CashRegisterResponseDto {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
  complexId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<CashRegisterResponseDto>) {
    Object.assign(this, partial);
  }
}
