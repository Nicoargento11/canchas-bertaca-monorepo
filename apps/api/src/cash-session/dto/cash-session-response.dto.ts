// src/cash-session/dto/cash-session-response.dto.ts
import { Expose, Exclude } from 'class-transformer';

export class CashSessionResponseDto {
  @Expose()
  id: string;

  @Expose()
  cashRegisterId: string;

  @Expose()
  userId: string;

  @Expose()
  startAt: Date;

  @Expose()
  endAt?: Date;

  @Expose()
  initialAmount: number;

  @Expose()
  finalAmount?: number;

  @Expose()
  totalCash?: number;

  @Expose()
  totalCard?: number;

  @Expose()
  totalTransfers?: number;

  @Expose()
  status: string;

  @Expose()
  observations?: string;

  @Exclude()
  createdAt?: Date;

  @Exclude()
  updatedAt?: Date;

  constructor(partial: Partial<CashSessionResponseDto>) {
    Object.assign(this, partial);
  }
}
