import { Injectable, NotFoundException } from '@nestjs/common';
import { Preference } from 'mercadopago';
import { mercadoPagoConfig } from './config/mercadoPago.config';
import { CreatePreferenceDto } from './dto/create-preference.dto';
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

  // @Cron(CronExpression.EVERY_10_MINUTES)
  // async checkExpiredReservations() {
  //   const reserves = await this.reserveService.findHasPaymentToken();
  //   await Promise.all(
  //     reserves.map(async (reserve) => {
  //       try {
  //         await this.jwtService.verify(reserve.paymentToken);
  //       } catch (error) {
  //         if (error.name === 'TokenExpiredError') {
  //           await this.reserveService.update(reserve.id, {
  //             date: reserve.date,
  //             courtId: reserve.courtId,
  //             schedule: reserve.schedule,
  //             paymentToken: null,
  //             paymentUrl: null,
  //             complexId: reserve.complexId,
  //             status: 'RECHAZADO',
  //           });
  //         }
  //       }
  //     }),
  //   );
  // }
  async createPreference({
    courtId,
    date,
    reservationAmount,
    schedule,
    reserveId,
    court,
    complex,
  }: CreatePreferenceDto) {
    // Validar que las URLs estén configuradas
    if (!process.env.PAYMENT_BACK_URL || !process.env.NOTIFICATION_URL) {
      throw new Error('Payment URLs are not properly configured');
    }

    const currentDateTime = new Date().toISOString();
    const expirationDateTime = new Date(
      Date.now() + 20 * 60 * 1000,
    ).toISOString();

    // Formatear fecha para mostrar
    const formattedDate = new Date(date)
      .toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '-');
    try {
      const payment = await new Preference(mercadoPagoConfig).create({
        body: {
          items: [
            {
              picture_url:
                'https://http2.mlstatic.com/D_NQ_NP_2X_711116-MLA46114833477_052021-F.jpg',
              id: reserveId,
              title: `Reserva C${court.courtNumber || court.name} - ${schedule} (${formattedDate})`,
              description: `Reserva de cancha ${courtId} para el ${formattedDate}`,
              unit_price: Number(reservationAmount),
              currency_id: 'ARS',
              quantity: 1,
              category_id: 'services',
            },
          ],

          auto_return: 'all',
          back_urls: {
            // success: `${process.env.FRONT_END_URL}/${complex.slug}/payment/success`,
            // failure: `${process.env.FRONT_END_URL}/${complex.slug}/payment/failure`,
            // pending: `${process.env.FRONT_END_URL}/${complex.slug}/payment/pending`,
            success: `https://${complex.slug}/payment/success`,
            failure: `https://${complex.slug}/payment/failure`,
            pending: `https://${complex.slug}/payment/pending`,
          },

          notification_url: `${process.env.NOTIFICATION_URL}/payments/mercadopago`,
          statement_descriptor: 'Reserva F5 Dimas',
          expires: true,
          expiration_date_from: currentDateTime,
          expiration_date_to: expirationDateTime,
          binary_mode: true,
          external_reference: reserveId,
          payment_methods: {
            excluded_payment_methods: [{ id: 'visa' }], // ✅ si el examen lo pide
            installments: 6, // ✅ máximo de cuotas permitido
          },
        },
      });

      return payment;
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error('Failed to create payment preference');
    }
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
    if (createDto.reserveId) {
      const reserve = await this.prisma.reserve.findUnique({
        where: { id: createDto.reserveId },
      });
      if (!reserve) {
        throw new NotFoundException('Reserve not found');
      }
    }

    return this.prisma.payment.create({
      data: {
        amount: createDto.amount,
        method: createDto.method,
        isPartial: createDto.isPartial,
        reserveId: createDto.reserveId, // Usando el campo directo
        complexId: createDto.complexId || undefined,
        cashSessionId: createDto.cashSessionId || undefined,
        transactionType: createDto.transactionType || 'RESERVA', // TODO arreglar harcodeada
      },

      include: {
        reserve: createDto.reserveId ? true : false,
        productSales: { include: { product: true } },
      },
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
