import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  CreatePaymentOnlineDto,
  PaymentPreferenceResponseDto,
} from './dto/create-payment.dto';
import { ReservesService } from 'src/reserves/reserves.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { PaymentMethod, SportName, Status } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UsersService } from 'src/users/users.service';
import { CreateReserveDto } from 'src/reserves/dto/create-reserve.dto';
import { CourtsService } from 'src/courts/courts.service';
import { ComplexService } from 'src/complexs/complexs.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly reserveService: ReservesService,
    private readonly userService: UsersService,
    private readonly courtService: CourtsService,
    private readonly complexService: ComplexService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) { }
  @Get('search')
  async searchPayments(@Query('complexId') complexId: string) {
    if (!complexId) {
      throw new HttpException('Complex ID is required', HttpStatus.BAD_REQUEST);
    }
    return await this.paymentsService.searchPayments(complexId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Crear pago online y reserva asociada' })
  @ApiResponse({
    status: 201,
    description: 'Preferencia de pago creada exitosamente',
    type: PaymentPreferenceResponseDto,
  })
  async createPayment(@Body() createPaymentDto: CreatePaymentOnlineDto) {
    try {
      // STEP 1: Validate and get data
      const courtData = await this.courtService.findOne(
        createPaymentDto.courtId,
      );
      const complex = await this.complexService.findOne(
        createPaymentDto.complexId,
      );
      const utcDate = this.convertToUTC(createPaymentDto.date);

      // STEP 2: Validate MercadoPago configuration BEFORE creating anything
      const hasMP = await this.complexService.hasMercadoPagoConfig(complex.id);
      if (!hasMP) {
        throw new HttpException(
          {
            message:
              'Este complejo no tiene MercadoPago configurado. Por favor contactá al administrador del complejo.',
            code: 'MP_NOT_CONFIGURED',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // STEP 3: Create DTO for reserve (but don't save yet)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 20 minutes
      const createReserveDto: CreateReserveDto = {
        ...createPaymentDto,
        date: utcDate,
        status: 'PENDIENTE',
        clientName: createPaymentDto.clientName || '',
        reserveType: createPaymentDto.reserveType,
        ...(createPaymentDto.fixedReserveId && {
          fixedReserveId: createPaymentDto.fixedReserveId,
        }),
        ...(createPaymentDto.promotionId && {
          promotionId: createPaymentDto.promotionId,
        }),
        expiresAt: expiresAt,
      };

      // STEP 4: Create reserve first (webhook needs this ID)
      const reserve = await this.reserveService.create(createReserveDto);
      this.reserveService.setReservationTimeout(reserve.id, 15 * 60 * 1000);

      // STEP 5: Try to create MP preference with REAL reserve ID
      let preference;
      try {
        preference = await this.paymentsService.createPreference({
          ...createPaymentDto,
          reserveId: reserve.id, // ← ID real para que webhook funcione
          court: courtData,
          complex: complex,
        });
      } catch (mpError) {
        // MP failed - ROLLBACK: delete the reserve we just created
        console.error('MercadoPago preference creation failed:', mpError);

        try {
          await this.reserveService.remove(reserve.id);
          console.log(`Reserve ${reserve.id} rolled back due to MP failure`);
        } catch (deleteError) {
          console.error('Failed to rollback reserve:', deleteError);
        }

        throw new HttpException(
          {
            message:
              'Error al generar el link de pago. Por favor intentá nuevamente. Si el problema persiste, contactá al complejo.',
            code: 'MP_PREFERENCE_FAILED',
            details: mpError.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // STEP 6: Update reserve with payment info
      const paymentToken = this.jwtService.sign({
        court: createPaymentDto.courtId,
        date: utcDate,
        schedule: createPaymentDto.schedule,
      });

      await this.userService.update(createPaymentDto.userId, {
        phone: createPaymentDto.phone,
      });

      await this.reserveService.update(reserve.id, {
        paymentUrl: preference.init_point,
        paymentToken,
        userId: createPaymentDto.userId,
        courtId: createPaymentDto.courtId,
        date: utcDate,
        schedule: createPaymentDto.schedule,
        complexId: createPaymentDto.complexId,
      });

      return preference;
    } catch (error) {
      // Re-throw HttpExceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      // Wrap unexpected errors
      console.error('Unexpected error in createPayment:', error);
      throw new HttpException(
        {
          message:
            'Error inesperado al procesar la reserva. Por favor intentá nuevamente.',
          code: 'UNEXPECTED_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Public()
  @Post('mercadopago')
  async handlePaymentNotification(
    @Req() req,
    @Query('complexId') complexId: string,
  ) {
    const body = req.body;

    // Validación inicial de tipo de notificación
    if (!body || !body.type || !body.data || !body.data.id) {
      throw new HttpException(
        { message: 'Invalid request payload' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const paymentId = body.data.id;

    if (!complexId) {
      throw new HttpException(
        { message: 'Missing complexId query parameter' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const searchedPayment = await this.paymentsService.getPaymentDetails(
        paymentId,
        complexId,
      );

      const searchedReserve = await this.reserveService.findById(
        searchedPayment.external_reference,
      );

      // TODO contemplar el caso en el que la tarjeta haya sido rechazada

      if (!searchedReserve) {
        throw new HttpException(
          { message: 'Reserve not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      // ✅ IDEMPOTENCIA: Si la reserva ya fue aprobada y MP dice "approved",
      // es un webhook duplicado/reenviado → no reprocesar
      if (
        searchedReserve.status === Status.APROBADO &&
        searchedPayment.status === 'approved'
      ) {
        console.log(
          `⚠️ Webhook duplicado ignorado: reserva ${searchedReserve.id} ya está APROBADA (MP payment: ${paymentId})`,
        );
        return {
          message: 'Payment already processed',
          status: 'already_approved',
        };
      }

      // ✅ IDEMPOTENCIA: Verificar si ya existe un pago de MercadoPago para esta reserva
      if (searchedPayment.status === 'approved') {
        const existingPayment = await this.prisma.payment.findFirst({
          where: {
            reserveId: searchedReserve.id,
            method: PaymentMethod.MERCADOPAGO,
          },
        });
        if (existingPayment) {
          console.log(
            `⚠️ Pago duplicado ignorado: ya existe payment MP para reserva ${searchedReserve.id} (payment: ${existingPayment.id})`,
          );
          return {
            message: 'Payment already recorded',
            status: 'already_paid',
          };
        }
      }

      const statusMapping = {
        approved: {
          status: Status.APROBADO,
          paymentUrl: null,
          paymentToken: null,
          paymentIdExt: searchedPayment.id.toString(),
        },
        rejected: {
          status: Status.PENDIENTE,
          paymentIdExt: searchedPayment.id.toString(),
        },
        pending: {
          status: Status.PENDIENTE,
          paymentIdExt: searchedPayment.id.toString(),
        },
      };

      // Actualizar la reserva
      const statusUpdate = statusMapping[searchedPayment.status];

      // if (searchedPayment.status === 'rejected') {
      //   const prueba = await this.paymentsService.cancelPayment(paymentId);
      // }

      if (!statusUpdate) {
        throw new HttpException(
          { message: 'Unknown payment status' },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.reserveService.update(searchedReserve.id, {
        ...statusUpdate,
        userId: searchedReserve.userId,
        date: searchedReserve.date,
        schedule: searchedReserve.schedule,
        courtId: searchedReserve.courtId,
        complexId: searchedReserve.complexId,
      });

      if (searchedPayment.status === 'approved') {
        this.reserveService.clearReservationTimeout(searchedReserve.id);
        const paymentDto: CreatePaymentDto = {
          amount: searchedPayment.transaction_amount,
          method: PaymentMethod.MERCADOPAGO,
          isPartial: true,
          reserveId: searchedReserve.id,
          transactionType: 'RESERVA',
          complexId: complexId,
        };

        await this.paymentsService.create(paymentDto);

        // ✅ Enviar mail al cliente confirmando la reserva
        await this.mailService.sendMail({
          to: searchedReserve.user.email,
          subject: `✅ Reserva confirmada en ${searchedReserve.complex.name}`,
          text: this.generatePlainTextEmail(searchedReserve),
          html: this.generateHtmlEmail(searchedReserve),
        });
      }

      return {
        message: 'Payment notification processed successfully',
        status: searchedPayment.status,
      };
    } catch (error) {
      console.error('Error processing payment notification:', error.message);
      throw new HttpException(
        { message: 'Error processing payment notification' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  create(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('by-reserve/:reserveId')
  findByReserve(@Param('reserveId') reserveId: string) {
    return this.paymentsService.findByReserve(reserveId);
  }

  @Get('total-paid/:reserveId')
  getTotalPaid(@Param('reserveId') reserveId: string) {
    return this.paymentsService.getTotalPaid(reserveId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  private convertToUTC(date: Date): Date {
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Fecha inválida proporcionada');
    }

    return new Date(
      Date.UTC(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
      ),
    );
  }

  private generatePlainTextEmail(reserve: any): string {
    return `
Hola ${reserve.clientName ?? 'Cliente'},

Tu reserva de ${this.getSportName(reserve.court.sportType)} en ${reserve.complex.name} ha sido confirmada:

📌 Complejo: ${reserve.complex.name}
📍 Dirección: ${reserve.complex.address}
📞 Teléfono: ${reserve.complex.phone || 'No disponible'}

🏅 Detalles de la reserva:
- Deporte: ${this.getSportName(reserve.court.sportType)}
- Fecha: ${new Date(reserve.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Hora: ${reserve.schedule}
- Cancha: ${reserve.court.name} (N° ${reserve.court.courtNumber})
${reserve.court.characteristics?.length ? '- Características: ' + reserve.court.characteristics.join(', ') : ''}

¡Gracias por reservar con nosotros!
${reserve.complex.name}
${reserve.complex.website ? '\n' + reserve.complex.website : ''}
`.trim();
  }

  private generateHtmlEmail(reserve: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reserva Confirmada</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
    <h1 style="margin: 0;">✅ Reserva en ${reserve.complex.name}</h1>
    <p style="margin: 5px 0 0; font-size: 1.2em;">${this.getSportName(reserve.court.sportType)} ${this.getSportIcon(reserve.court.sportType)}</p>
  </div>
  
  <div style="padding: 20px;">
    <p>Hola <strong>${reserve.clientName ?? 'Cliente'}</strong>,</p>
    <p>Tu reserva en <strong>${reserve.complex.name}</strong> ha sido confirmada con éxito:</p>
    
    <!-- Información del complejo -->
    <div style="background-color: #f0f7ff; border-radius: 8px; padding: 15px; margin: 15px 0; border: 1px solid #d0e3ff;">
      <h3 style="margin-top: 0; color: #2c5282;">🏟️ Complejo Deportivo</h3>
      <p style="margin: 5px 0;"><strong>${reserve.complex.name}</strong></p>
      <p style="margin: 5px 0;">📍 ${reserve.complex.address}</p>
      ${reserve.complex.phone ? `<p style="margin: 5px 0;">📞 ${reserve.complex.phone}</p>` : ''}
      ${reserve.complex.website ? `<p style="margin: 5px 0;">🌐 <a href="${reserve.complex.website}" style="color: #2b6cb0;">${reserve.complex.website}</a></p>` : ''}
    </div>
    
    <!-- Detalles de la reserva -->
    <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4CAF50;">📅 Detalles de la Reserva</h3>
      <ul style="padding-left: 20px;">
        <li><strong>Deporte:</strong> ${this.getSportName(reserve.court.sportType)} ${this.getSportIcon(reserve.court.sportType)}</li>
        <li><strong>Fecha:</strong> ${new Date(reserve.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
        <li><strong>Hora:</strong> ${reserve.schedule}</li>
        <li><strong>Cancha:</strong> ${reserve.court.name} (N° ${reserve.court.courtNumber})</li>
        ${reserve.court.characteristics?.length
        ? `
          <li>
            <strong>Características:</strong>
            <ul style="padding-left: 20px; margin-top: 5px;">
              ${reserve.court.characteristics.map((feature) => `<li>${feature}</li>`).join('')}
            </ul>
          </li>
        `
        : ''
      }
      </ul>
    </div>

    <p style="text-align: center; background-color: #e3f2fd; padding: 12px; border-radius: 8px;">
      ${this.getSportIcon(reserve.court.sportType)} ¡Que disfrutes tu partido de ${this.getSportName(reserve.court.sportType)} en ${reserve.complex.name}!
    </p>
    <div style="font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
      <p>Si tienes alguna pregunta, no dudes en contactar al complejo:</p>
      ${reserve.complex.phone ? `<p>📞 Teléfono: <a href="tel:${reserve.complex.phone}">${reserve.complex.phone}</a></p>` : ''}
      ${reserve.complex.email ? `<p>✉️ Email: <a href="mailto:${reserve.complex.email}">${reserve.complex.email}</a></p>` : ''}
    </div>
  </div>
  
  <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 0.8em; color: #666;">
    <p>© ${new Date().getFullYear()} ${reserve.complex.name}. Todos los derechos reservados.</p>
  </div>
</body>
</html>
`;
  }

  // Métodos auxiliares para convertir el enum a nombres legibles
  private getSportName(sportType: SportName): string {
    const sportNames = {
      [SportName.FUTBOL_5]: 'Fútbol 5',
      [SportName.FUTBOL_7]: 'Fútbol 7',
      [SportName.FUTBOL_11]: 'Fútbol 11',
      [SportName.PADEL]: 'Pádel',
      [SportName.TENIS]: 'Tenis',
      [SportName.BASKET]: 'Básquetbol',
      [SportName.VOLEY]: 'Vóley',
      [SportName.HOCKEY]: 'Hockey',
    };
    return sportNames[sportType] || 'Deporte';
  }

  private getSportIcon(sportType: SportName): string {
    const sportIcons = {
      [SportName.FUTBOL_5]: '⚽',
      [SportName.FUTBOL_7]: '⚽',
      [SportName.FUTBOL_11]: '⚽',
      [SportName.PADEL]: '🎾',
      [SportName.TENIS]: '🎾',
      [SportName.BASKET]: '🏀',
      [SportName.VOLEY]: '🏐',
      [SportName.HOCKEY]: '🏒',
    };
    return sportIcons[sportType] || '🏆';
  }
}
