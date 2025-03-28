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
} from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { UpdateReserveDto } from './dto/update-reserve.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { allCourts } from './reserves.constants';
import { ScheduleDayService } from 'src/schedule-days/schedule-days.service';
import { splitIntoOneHourIntervals } from 'src/utils/splitIntoOneHourIntervals';
import { PaymentsService } from 'src/payments/payments.service';

@Controller('reserves')
export class ReservesController {
  constructor(
    private readonly reservesService: ReservesService,
    private readonly scheduleDaysService: ScheduleDayService,
    private readonly paymentService: PaymentsService,
  ) {}

  @Public() // TODO: quitarlo, solo para probar
  @Post('create')
  create(@Body() createReserveDto: CreateReserveDto) {
    const utcDate = new Date(
      Date.UTC(
        createReserveDto.date.getFullYear(),
        createReserveDto.date.getMonth(),
        createReserveDto.date.getDate(),
      ),
    );
    return this.reservesService.create({ ...createReserveDto, date: utcDate });
  }

  @Public()
  @Get('available-turns-day')
  async getAvailableSchedulesByDay(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('The "date" query parameter is required.');
    }

    // 1. Validar formato de fecha
    const parsedDate = new Date(date.replace(/-/g, '/'));
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }

    const dayOfWeek = new Date(date.replace(/-/g, '/')).getDay();
    const scheduleDays = await this.scheduleDaysService.findByDay(dayOfWeek);

    if (!scheduleDays) {
      return []; // No hay horarios definidos para ese día
    }

    // Obtener los turnos fijos activos para ese día
    const fixedSchedules =
      scheduleDays.FixedSchedule.filter((fixed) => fixed.isActive) || [];

    // Función para dividir un rango en intervalos de una hora
    const splitIntoOneHourIntervals = (
      startTime: string,
      endTime: string,
    ): string[] => {
      const intervals: string[] = [];
      let currentStart = startTime;

      while (currentStart < endTime) {
        // Calcular la hora de fin (una hora después)
        const [currentHour, currentMinute] = currentStart.split(':');
        const nextHour = String(Number(currentHour) + 1).padStart(2, '0');
        const currentEnd = `${nextHour}:${currentMinute}`;

        // Agregar el intervalo al array
        intervals.push(`${currentStart} - ${currentEnd}`);

        // Mover a la siguiente hora
        currentStart = currentEnd;
      }

      return intervals;
    };

    // Generar allSchedules dinámicamente a partir de scheduleDays.schedules
    const allSchedules =
      scheduleDays.schedules.flatMap((schedule) => {
        return splitIntoOneHourIntervals(schedule.startTime, schedule.endTime);
      }) || [];

    // Ordenar allSchedules de menor a mayor (por startTime)
    allSchedules.sort((a, b) => {
      const [startA] = a.split(' - ');
      const [startB] = b.split(' - ');
      return startA.localeCompare(startB);
    });

    const reservedDays = (await this.reservesService.findByDay(date)) || [];

    // Combinar reservas y turnos fijos
    const allReservations = [
      ...reservedDays.map((reservation) => {
        // Parsear el campo schedule (ej: "16:00 - 17:00")
        const [startTime, endTime] = reservation.schedule.split(' - ');
        return {
          court: reservation.court,
          startTime,
          endTime,
        };
      }),
      ...fixedSchedules.map((fixed) => ({
        court: fixed.court,
        startTime: fixed.startTime,
        endTime: fixed.endTime,
      })),
    ];

    // Parsear allSchedules para obtener startTime y endTime
    const parsedSchedules = allSchedules.map((schedule) => {
      const [startTime, endTime] = schedule.split(' - ');
      return { startTime, endTime };
    });

    // Filtrar las canchas disponibles por horario
    const reservationsForSchedule = parsedSchedules.map((schedule) => {
      const { startTime: scheduleStart, endTime: scheduleEnd } = schedule;

      // Canchas reservadas en este horario específico
      const reservedCourtsInSchedule = allReservations
        .filter((reservation) => {
          // Verificar si el horario de la reserva/turno fijo se solapa con el horario actual
          return (
            reservation.startTime < scheduleEnd &&
            reservation.endTime > scheduleStart
          );
        })
        .map((reservation) => reservation.court);

      // Canchas disponibles en este horario
      const availableCourts = allCourts.filter(
        (court) => !reservedCourtsInSchedule.includes(court),
      );

      return {
        schedule: `${scheduleStart} - ${scheduleEnd}`,
        court: availableCourts,
      };
    });

    return reservationsForSchedule;
  }

  @Public()
  @Get('available-turns-schedule')
  async getAvailableSchedulesBySchedule(
    @Query('date') date: string,
    @Query('schedule') schedule: string,
  ) {
    if (!date || !schedule) {
      throw new BadRequestException(
        'The "date" and "schedule" query parameters are required.',
      );
    }

    const dayOfWeek = new Date(date.replace(/-/g, '/')).getDay();
    const scheduleDays = await this.scheduleDaysService.findByDay(dayOfWeek);

    // Obtener los turnos fijos activos para ese día y horario específico
    const fixedSchedules = scheduleDays.FixedSchedule.filter((fixed) => {
      const fixedStartTime = fixed.startTime;
      const fixedEndTime = fixed.endTime;
      const [scheduleStart, scheduleEnd] = schedule.split(' - ');

      // Verificar si el turno fijo coincide con el horario especificado
      return (
        fixed.isActive &&
        fixedStartTime === scheduleStart &&
        fixedEndTime === scheduleEnd
      );
    });

    // Obtener las reservas para el día y horario específico
    const reserves = await this.reservesService.findBySchedule(date, schedule);

    // Combinar reservas y turnos fijos para obtener las canchas ocupadas
    const allReservations = [
      ...reserves.map((reservation) => ({
        court: reservation.court,
      })),
      ...fixedSchedules.map((fixed) => ({
        court: fixed.court,
      })),
    ];
    console.log(allReservations);

    // Obtener las canchas ocupadas
    const reservedCourts = allReservations.map(
      (reservation) => reservation.court,
    );

    // Filtrar las canchas disponibles
    const availableCourts = allCourts.filter(
      (court) => !reservedCourts.includes(court),
    );

    return { schedule, court: availableCourts };
  }

  @Public()
  @Get('reserves-turns-day')
  async getReservesTurnsByDay(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException(
        'The "date" query parameters are required.',
      );
    }

    const dayOfWeek = new Date(date.replace(/-/g, '/')).getDay();
    const scheduleDays = await this.scheduleDaysService.findByDay(dayOfWeek);

    const fixedSchedules = scheduleDays.FixedSchedule.filter(
      (fixed) => fixed.isActive,
    );

    const allSchedules = scheduleDays.schedules.flatMap((schedule) => {
      return splitIntoOneHourIntervals(schedule.startTime, schedule.endTime);
    });

    const reservedDays = await this.reservesService.findByDay(date);
    console.log(reservedDays);
    console.log(fixedSchedules);

    const allReservations = [
      ...reservedDays.map((reservation) => {
        return {
          id: reservation.id,
          court: reservation.court,
          schedule: reservation.schedule,
          clientName: reservation.clientName || reservation.User.name,
          reserveType: 'RESERVA',
          reservationAmount: reservation.reservationAmount,
          status: reservation.status,
        };
      }),
      ...fixedSchedules.map((fixed) => ({
        id: fixed.id,
        court: fixed.court,
        schedule: `${fixed.startTime} - ${fixed.endTime}`,
        clientName: fixed.user.name,
        reserveType: 'FIJO',
      })),
    ];

    console.log(allSchedules);

    const reservationsForSchedule = allSchedules.map((schedule) => {
      const reservations = allReservations.filter(
        (r) => r.schedule === schedule,
      );

      return {
        schedule: schedule,
        court: reservations,
      };
    });
    console.log(reservationsForSchedule);
    return reservationsForSchedule;
  }

  @Public()
  @Get()
  findAll() {
    return this.reservesService.findAll();
  }

  @Public()
  @Get('by-hour')
  findByHour(@Query('hour') date: string, schedule: string) {
    return this.reservesService.findBySchedule(date, schedule);
  }

  @Public()
  @Get('by-day')
  findByDay(@Query('day') date: string) {
    return this.reservesService.findByDay(date);
  }

  @Public()
  @Get('by-month')
  findByMonth(@Query('year') year: number, @Query('month') month: number) {
    return this.reservesService.findByMonth(year, month);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservesService.findById(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReserveDto: UpdateReserveDto) {
    const utcDate = new Date(
      Date.UTC(
        updateReserveDto.date.getFullYear(),
        updateReserveDto.date.getMonth(),
        updateReserveDto.date.getDate(),
      ),
    );
    return this.reservesService.update(id, {
      ...updateReserveDto,
      date: utcDate,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const reserveFound = await this.reservesService.findById(id);
    if (!reserveFound) {
      throw new BadRequestException('Reserve not found.');
    }
    return this.reservesService.remove(id);
  }
}
