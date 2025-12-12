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
        if (payment.method === 'EFECTIVO') acc.cash += payment.amount;
        if (payment.method === 'TARJETA_CREDITO') acc.card += payment.amount;
        if (payment.method === 'TRANSFERENCIA') acc.transfer += payment.amount;
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
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }
    const totals = session.payments.reduce(
      (acc, payment) => {
        if (payment.method === 'EFECTIVO') acc.CASH += payment.amount;
        if (payment.method === 'TARJETA_CREDITO') acc.CARD += payment.amount;
        if (payment.method === 'TRANSFERENCIA') acc.TRANSFER += payment.amount;
        if (payment.method === 'MERCADOPAGO')
          acc.MERCADOPAGO = (acc.MERCADOPAGO || 0) + payment.amount;
        if (payment.method === 'OTRO')
          acc.OTHER = (acc.OTHER || 0) + payment.amount;
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

    return {
      ...session,
      totals,
      difference:
        session.status === 'CLOSED' ? session.finalAmount - totals.CASH : null,
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
}
