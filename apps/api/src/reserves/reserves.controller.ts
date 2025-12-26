import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { UpdateReserveDto } from './dto/update-reserve.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { ScheduleHelper } from './helpers/schedule.helper';
import { ComplexService } from 'src/complexs/complexs.service';
import { SportTypesService } from 'src/sport-types/sport-types.service';
import { Status } from '@prisma/client';

@Controller('reserves')
export class ReservesController {
  constructor(
    private readonly reservesService: ReservesService,
    private readonly scheduleHelper: ScheduleHelper,
    private readonly complexesService: ComplexService,
    private readonly sportTypesService: SportTypesService,
  ) { }

  // ----------------------------
  // OPERACIONES CRUD BÁSICAS
  // ----------------------------

  // @Public()
  // @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReserveDto: CreateReserveDto) {
    const utcDate = this.convertToUTC(createReserveDto.date);
    return this.reservesService.create({ ...createReserveDto, date: utcDate });
  }

  // @Public()
  // @Get()
  // findAll() {
  //   return this.reservesService.findAll();
  // }

  @Public()
  @Get('paginate')
  async paginate(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('complexId') complexId?: string,
  ) {
    return this.reservesService.paginate(
      Number(page),
      Number(limit),
      complexId,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservesService.findById(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReserveDto: UpdateReserveDto) {
    const utcDate = this.convertToUTC(updateReserveDto.date);
    return this.reservesService.update(id, {
      ...updateReserveDto,
      date: utcDate,
    });
  }

  // quiero un endpoint q actualize el estado de una reserva
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    await this.validateReserveExists(id);
    return this.reservesService.updateStatus(id, status as Status);
  }

  @Public()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.validateReserveExists(id);
    return this.reservesService.remove(id);
  }

  // Deduct gift product stock from a reservation
  @Post(':id/deduct-gift-stock')
  async deductGiftStock(@Param('id') id: string) {
    const reserve = await this.reservesService.findById(id);
    if (!reserve) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return this.reservesService.deductGiftProductStock(reserve);
  }

  // ----------------------------
  // CONSULTAS ESPECÍFICAS
  // ----------------------------

  @Public()
  @Get('by-day/schedules')
  async getAvailableSchedulesByDay(
    @Query('date') date: string,
    @Query('complexId') complexId: string,
    @Query('sportTypeId') sportTypeId: string,
  ) {
    this.validateDateQueryParam(date);
    const parsedDate = this.parseDate(date);

    const scheduleInfo = await this.scheduleHelper.getScheduleInfo(
      parsedDate,
      complexId,
    );

    if (!scheduleInfo) {
      return [];
    }

    const reservations = await this.reservesService.findByDay(
      date,
      complexId,
      sportTypeId,
    );
    return this.scheduleHelper.getAvailableSchedules(
      scheduleInfo,
      reservations,
      complexId,
      sportTypeId,
    );
  }

  @Public()
  @Get('by-day/reservations')
  async getReservationsByDay(
    @Query('date') date: string,
    @Query('complexId') complexId: string,
    @Query('sportTypeId') sportTypeId: string,
  ) {
    this.validateDateQueryParam(date);
    const parsedDate = this.parseDate(date);

    const scheduleInfo = await this.scheduleHelper.getScheduleInfo(
      parsedDate,
      complexId,
      sportTypeId,
    );

    if (!scheduleInfo) {
      return [];
    }

    const reservations = await this.reservesService.findByDay(
      date,
      complexId,
      sportTypeId,
    );

    const result = this.scheduleHelper.getReservationsBySchedule(
      scheduleInfo,
      reservations,
    );

    return result;
  }

  @Get('availability/schedule')
  async getAvailabilityForSchedule(
    @Query('date') date: string,
    @Query('schedule') schedule: string,
    @Query('complexId') complexId: string,
    @Query('sportTypeId') sportTypeId: string,
  ) {
    this.validateDateAndScheduleParams(date, schedule);
    const parsedDate = this.parseDate(date);

    const scheduleInfo = await this.scheduleHelper.getScheduleInfo(
      parsedDate,
      complexId,
    );

    if (!scheduleInfo) {
      return [];
    }

    const reservations = await this.reservesService.findBySchedule(
      date,
      schedule,
      complexId,
      sportTypeId,
    );

    const result = await this.scheduleHelper.getAvailabilityForSchedule(
      scheduleInfo,
      reservations,
      schedule,
      complexId, // Pasar el complexId
      sportTypeId,
    );
    return result;
  }

  @Get('availability/daily')
  async getDailyAvailability(
    @Query('date') dateString: string,
    @Query('complexId') complexId: string,
    @Query('sportTypeId') sportTypeId: string,
  ) {
    this.validateDateQueryParam(dateString);
    const date = this.parseDate(dateString);

    const scheduleInfo = await this.scheduleHelper.getScheduleInfo(
      date,
      complexId,
      sportTypeId,
    );

    if (!scheduleInfo) {
      return [];
    }

    const reservations = await this.reservesService.findByDay(
      dateString,
      complexId,
      sportTypeId,
    );

    return this.scheduleHelper.getAvailableSchedules(
      scheduleInfo,
      reservations,
      complexId,
      sportTypeId,
    );
  }

  // ----------------------------
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // ----------------------------

  private async validateReserveExists(id: string) {
    const reserve = await this.reservesService.findById(id);
    if (!reserve) {
      throw new NotFoundException('Reserva no encontrada');
    }
  }

  private async validateComplexExists(complexId: string) {
    const exists = await this.complexesService.findOne(complexId);
    if (!exists) {
      throw new NotFoundException(`Complex with ID ${complexId} not found`);
    }
  }

  private async validateSportTypeExists(sportTypeId: string) {
    const exists = await this.sportTypesService.exists(sportTypeId);
    if (!exists) {
      throw new NotFoundException(
        `Sport type with ID ${sportTypeId} not found`,
      );
    }
  }

  private validateDateQueryParam(date: string) {
    if (!date) {
      throw new BadRequestException('El parámetro "date" es requerido');
    }
  }

  private validateDateAndScheduleParams(date: string, schedule: string) {
    if (!date || !schedule) {
      throw new BadRequestException(
        'Los parámetros "date" y "schedule" son requeridos',
      );
    }
  }

  private parseDate(dateString: string): Date {
    const date = new Date(dateString.replace(/-/g, '/'));
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }
    return date;
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
}
