import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    private readonly reserveService: ReservesService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkExpiredReservations() {
    const reserves = await this.reserveService.findHasPaymentToken();
    await Promise.all(
      reserves.map(async (reserve) => {
        try {
          await this.jwtService.verify(reserve.paymentToken);
        } catch (error) {
          if (error.name === 'TokenExpiredError') {
            await this.reserveService.update(reserve.id, {
              paymentToken: null,
              paymentUrl: null,
              status: 'RECHAZADO',
            });
          }
        }
      }),
    );
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
}
