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
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  CreatePaymentOnlineDto,
} from './dto/create-payment.dto';
import { ReservesService } from 'src/reserves/reserves.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { UsersService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { Payment } from 'mercadopago';
import { mercadoPagoConfig } from './config/mercadoPago.config';
import { PaymentMethod, Status } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly reserveService: ReservesService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  // TODO quitar public
  @Public()
  @Post('create')
  async createPayment(@Body() createPaymentDto: CreatePaymentOnlineDto) {
    // TODO simplificar al objeto y usar spread operator para pasar los datos y verificar que funcione
    const utcDate = new Date(
      Date.UTC(
        createPaymentDto.date.getFullYear(),
        createPaymentDto.date.getMonth(),
        createPaymentDto.date.getDate(),
      ),
    );
    const reserve = await this.reserveService.create({
      date: utcDate,
      schedule: createPaymentDto.schedule,
      court: createPaymentDto.court,
      price: createPaymentDto.price,
      reservationAmount: createPaymentDto.reservationAmount,
      userId: createPaymentDto.userId,
      status: 'PENDIENTE',
      phone: createPaymentDto.phone,
    });

    const preference = await this.paymentsService.createPreference({
      ...createPaymentDto,
      reserveId: reserve.id,
    });

    const paymentToken = this.jwtService.sign({
      court: createPaymentDto.court,
      date: createPaymentDto.date,
      schedule: createPaymentDto.schedule,
    });

    await this.userService.update(createPaymentDto.userId, {
      phone: createPaymentDto.phone,
    });

    await this.reserveService.update(preference.items[0].id, {
      paymentUrl: preference.init_point,
      paymentToken,
    });

    // TODO logica del token expire
    return preference;
  }
  @Public()
  @Post('mercadopago')
  async handlePaymentNotification(@Req() req) {
    const body = req.body;

    // Validación inicial de tipo de notificación
    if (!body || !body.type || !body.data || !body.data.id) {
      throw new HttpException(
        { message: 'Invalid request payload' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const paymentId = body.data.id;

    try {
      const searchedPayment = await new Payment(mercadoPagoConfig).get({
        id: paymentId,
      });

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
      const statusMapping = {
        approved: {
          status: Status.APROBADO,
          paymentUrl: null,
          paymentToken: null,
          paymentId: searchedPayment.id.toString(),
        },
        rejected: {
          status: Status.PENDIENTE,
          paymentId: searchedPayment.id.toString(),
        },
        pending: {
          status: Status.PENDIENTE,
          paymentId: searchedPayment.id.toString(),
        },
      };

      // Actualizar la reserva
      const statusUpdate = statusMapping[searchedPayment.status];

      // if (searchedPayment.status === 'rejected') {
      //   const prueba = await this.paymentsService.cancelPayment(paymentId);
      //   console.log(prueba);
      // }

      if (!statusUpdate) {
        throw new HttpException(
          { message: 'Unknown payment status' },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.reserveService.update(searchedReserve.id, statusUpdate);

      // Crear el registro de pago
      const paymentDto: CreatePaymentDto = {
        amount: searchedPayment.transaction_amount,
        method: PaymentMethod.MERCADOPAGO, // Asumiendo que MERCADOPAGO está en tu enum
        isPartial: true, // O puedes determinar esto basado en algún criterio
        reserveId: searchedReserve.id,
      };

      await this.paymentsService.create(paymentDto);

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
}
