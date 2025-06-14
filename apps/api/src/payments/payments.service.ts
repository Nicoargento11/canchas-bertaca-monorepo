import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Preference } from 'mercadopago';
import { mercadoPagoConfig } from './config/mercadoPago.config';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservesService } from 'src/reserves/reserves.service';
import { JwtService } from '@nestjs/jwt';
import { Payment } from 'mercadopago';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(ReservesService.name);
  constructor(
    private readonly reserveService: ReservesService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkExpiredReservations() {
    this.logger.log('Iniciando verificación de reservas expiradas...');
    try {
      const expiredReservations =
        await this.reserveService.findPendingWithToken();
      let processedCount = 0;
      const batchSize = 50; // Procesa en bloques de 50 reservas
      for (let i = 0; i < expiredReservations.length; i += batchSize) {
        const batch = expiredReservations.slice(i, i + batchSize);

        await this.processBatch(batch);
        processedCount += batch.length;
      }
      this.logger.log(`Procesadas ${processedCount} reservas expiradas.`);
    } catch (error) {
      this.logger.error('Error en checkExpiredReservations:', error.stack);
    }
  }
  createPreference({
    court,
    date,
    reservationAmount,
    schedule,
    reserveId,
  }: CreatePreferenceDto) {
    // Obtener la fecha y hora actual en formato ISO 8601
    const currentDateTime = new Date().toISOString();
    const expirationDateTime = new Date(
      Date.now() + 20 * 60 * 1000,
    ).toISOString();
    const payment = new Preference(mercadoPagoConfig).create({
      body: {
        items: [
          {
            id: reserveId,
            title: `${date.toLocaleString('es-AR')} C${court} ${schedule}`,
            description: date.toLocaleDateString(),
            unit_price: reservationAmount,
            currency_id: 'ARS',
            quantity: 1,
            category_id: 'services',
          },
        ],
        back_urls: {
          success: `${process.env.PAYMENT_BACK_URL}/payment/succes`,
          failure: `${process.env.PAYMENT_BACK_URL}/payment/failure`,
          pending: `${process.env.PAYMENT_BACK_URL}/`,
        },
        notification_url: `${process.env.NOTIFICATION_URL}/payments/mercadopago`,
        statement_descriptor: 'Reserva cancha F5 Dimas',
        auto_return: 'approved',
        expires: true,
        expiration_date_from: currentDateTime,
        expiration_date_to: expirationDateTime,
        binary_mode: true,
        external_reference: reserveId,
      },
    });
    return payment;
  }

  cancelPayment(paymentId: string) {
    const payment = new Payment(mercadoPagoConfig);
    return payment
      .cancel({ id: paymentId })
      .then((response) => response)
      .catch((error) => error);
  }

  async create(createDto: CreatePaymentDto) {
    // Verificar que la reserva existe
    const reserve = await this.prisma.reserves.findUnique({
      where: { id: createDto.reserveId },
    });
    if (!reserve) {
      throw new NotFoundException('Reserve not found');
    }

    return this.prisma.payment.create({
      data: {
        amount: createDto.amount,
        method: createDto.method,
        isPartial: createDto.isPartial,
        reserveId: createDto.reserveId, // Usando el campo directo
      },
      include: { reserve: true },
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: { reserve: true },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { reserve: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByReserve(reserveId: string) {
    return this.prisma.payment.findMany({
      where: { reserveId },
      include: { reserve: true },
    });
  }

  async getTotalPaid(reserveId: string) {
    const payments = await this.findByReserve(reserveId);
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  async update(id: string, updateDto: UpdatePaymentDto) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.payment.update({
      where: { id },
      data: updateDto,
      include: { reserve: true },
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.payment.delete({
      where: { id },
    });
  }

  private async processBatch(
    reservations: Array<{
      id: string;
      date: Date;
      schedule: string;
      court: number;
      userId: string;
      paymentToken: string;
    }>,
  ) {
    const updates = [];

    for (const reserve of reservations) {
      try {
        await this.jwtService.verify(reserve.paymentToken);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          updates.push(
            await this.reserveService.update(reserve.id, {
              paymentToken: null,
              paymentUrl: null,
              status: 'RECHAZADO',
              userId: reserve.userId,
              date: reserve.date,
              court: reserve.court,
              schedule: reserve.schedule,
            }),
          );
        }
      }
    }

    if (updates.length > 0) {
      await this.prisma.$transaction(updates); // Ejecuta todas las actualizaciones en una sola transacción
    }
  }
}
