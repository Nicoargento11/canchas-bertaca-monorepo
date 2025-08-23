// src/cash-session/entities/cash-session.entity.ts
import { Payment, SessionStatus, User } from '@prisma/client';
import { CashRegister } from '../../cash-register/entities/cash-register.entity';

export class CashSession {
  id: string;
  cashRegister: CashRegister;
  cashRegisterId: string;
  user: User;
  userId: string;
  startAt: Date;
  endAt?: Date;
  initialAmount: number;
  finalAmount?: number;
  totalCash?: number;
  totalCard?: number;
  totalTransfers?: number;
  status: SessionStatus;
  payments?: Payment[];
  observations?: string;
}
