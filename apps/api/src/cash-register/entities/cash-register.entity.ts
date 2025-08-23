// src/cash-register/entities/cash-register.entity.ts

import { CashSession, Complex } from '@prisma/client';

export class CashRegister {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
  complex: Complex;
  complexId: string;
  sessions?: CashSession[];
  createdAt: Date;
  updatedAt: Date;
}
