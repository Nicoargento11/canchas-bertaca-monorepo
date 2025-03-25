import { Injectable } from '@nestjs/common';
import { Preference } from 'mercadopago';
import { mercadoPagoConfig } from './config/mercadoPago.config';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservesService } from 'src/reserves/reserves.service';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Payment } from 'mercadopago';
import { createPublicKey } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly reserveService: ReservesService,
    private jwtService: JwtService,
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
    userId,
    phone,
    price,
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
          success: `${process.env.PAYMENT_BACK_URL}/`,
          failure: `${process.env.PAYMENT_BACK_URL}/`,
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
    console.log(payment);
    return payment;
  }

  cancelPayment(paymentId: string) {
    const payment = new Payment(mercadoPagoConfig);
    return payment
      .cancel({ id: paymentId })
      .then((response) => response)
      .catch((error) => error);
  }
}
