// src/cash-session/cash-session.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCashSessionDto } from './dto/create-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CashSessionService {
  constructor(private prisma: PrismaService) {}

  async openSession(createCashSessionDto: CreateCashSessionDto) {
    // Verificar que no haya sesión activa
    const activeSession = await this.prisma.cashSession.findFirst({
      where: {
        cashRegisterId: createCashSessionDto.cashRegisterId,
        status: 'ACTIVE',
      },
    });

    if (activeSession) {
      // lanzar excepcion de que la sesion ya esta activa error 401
      throw new ConflictException(
        'No se puede abrir una nueva sesión. Ya existe una sesión activa para esta caja.',
      );
    }

    return this.prisma.cashSession.create({
      data: {
        ...createCashSessionDto,
        status: 'ACTIVE',
      },
    });
  }

  async closeSession(id: string, closeCashSessionDto: CloseCashSessionDto) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (session.status !== 'ACTIVE') {
      throw new Error('La sesión ya está cerrada o cancelada');
    }

    // Calcular totales
    const totals = session.payments.reduce(
      (acc, payment) => {
        // Determinar si es un ingreso o egreso
        const isExpense =
          payment.transactionType === 'GASTO' ||
          payment.transactionType === 'EGRESO';
        const multiplier = isExpense ? -1 : 1;

        if (payment.method === 'EFECTIVO')
          acc.cash += payment.amount * multiplier;
        if (payment.method === 'TARJETA_CREDITO')
          acc.card += payment.amount * multiplier; // Asumiendo que se pueden anular cobros con tarjeta
        if (payment.method === 'TRANSFERENCIA')
          acc.transfer += payment.amount * multiplier;
        return acc;
      },
      { cash: 0, card: 0, transfer: 0 },
    );

    return this.prisma.cashSession.update({
      where: { id },
      data: {
        endAt: new Date(),
        status: 'CLOSED',
        finalAmount: closeCashSessionDto.finalAmount,
        totalCash: totals.cash,
        totalCard: totals.card,
        totalTransfers: totals.transfer,
        observations: closeCashSessionDto.observations,
      },
    });
  }

  async getActiveSession(cashRegisterId: string) {
    return this.prisma.cashSession.findFirst({
      where: {
        cashRegisterId,
        status: 'ACTIVE',
      },
      include: { cashRegister: true },
    });
  }

  async getActiveSessionByUser(userId: string, complexId?: string) {
    const whereClause: any = {
      userId,
      status: 'ACTIVE',
    };

    // Si se proporciona complexId, filtrar por cashRegister.complexId
    if (complexId) {
      whereClause.cashRegister = { complexId };
    }

    return this.prisma.cashSession.findFirst({
      where: whereClause,
      include: { cashRegister: true },
    });
  }

  async getSessionSummary(id: string) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id },
      include: {
        payments: {
          include: {
            sale: {
              include: {
                productSales: { include: { product: true } },
              },
            },
            reserve: {
              include: {
                user: true,
                court: true,
              },
            },
          },
        },
        user: true,
        cashRegister: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }
    const totals = session.payments.reduce(
      (acc, payment) => {
        const isExpense =
          payment.transactionType === 'GASTO' ||
          payment.transactionType === 'EGRESO';
        const multiplier = isExpense ? -1 : 1;

        if (payment.method === 'EFECTIVO')
          acc.CASH += payment.amount * multiplier;
        if (payment.method === 'TARJETA_CREDITO')
          acc.CARD += payment.amount * multiplier;
        if (payment.method === 'TRANSFERENCIA')
          acc.TRANSFER += payment.amount * multiplier;
        if (payment.method === 'MERCADOPAGO')
          acc.MERCADOPAGO =
            (acc.MERCADOPAGO || 0) + payment.amount * multiplier;
        if (payment.method === 'OTRO')
          acc.OTHER = (acc.OTHER || 0) + payment.amount * multiplier;
        return acc;
      },
      {
        CASH: 0,
        CARD: 0,
        TRANSFER: 0,
        MERCADOPAGO: 0,
        OTHER: 0,
      },
    );

    // Diferencia = Lo que hay (Final) - (Lo que había (Inicial) + Flujo Neto Efectivo)
    const expectedCash = session.initialAmount + totals.CASH;

    return {
      ...session,
      totals,
      difference:
        session.status === 'CLOSED' && session.finalAmount !== null
          ? session.finalAmount - expectedCash
          : null,
    };
  }

  async findSessionHistory(cashRegisterId: string, days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.prisma.cashSession.findMany({
      where: {
        cashRegisterId,
        // endAt: { not: null, gte: date },
        // status: 'CLOSED',
      },
      orderBy: { endAt: 'desc' },
    });
  }

  async getSessionsByComplex(complexId: string) {
    return this.prisma.cashSession.findMany({
      where: {
        cashRegister: {
          complexId: complexId,
        },
      },
      include: {
        user: true,
        cashRegister: true,
      },
      orderBy: {
        startAt: 'desc',
      },
    });
  }
}
