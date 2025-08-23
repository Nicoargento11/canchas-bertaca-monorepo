import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AutomaticReservesService } from '../services/automatic-reserves.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Automatic Reserves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automatic-reserves')
export class AutomaticReservesController {
  constructor(
    private readonly automaticReservesService: AutomaticReservesService,
  ) {}

  @Post('create-daily')
  @ApiOperation({
    summary: 'Crear reservas automáticas para hoy',
    description:
      'Ejecuta manualmente el proceso de creación de reservas automáticas para el día actual',
  })
  @ApiResponse({
    status: 201,
    description: 'Reservas automáticas creadas exitosamente',
  })
  async createDailyReserves() {
    return this.automaticReservesService.createDailyFixedReserves();
  }

  @Post('create-for-date')
  @ApiOperation({
    summary: 'Crear reservas automáticas para una fecha específica',
    description: 'Crea las reservas automáticas para una fecha determinada',
  })
  @ApiResponse({
    status: 201,
    description:
      'Reservas automáticas creadas exitosamente para la fecha especificada',
  })
  async createReservesForDate(@Body('date') dateString: string) {
    const date = this.parseDate(dateString);
    const createdReserves =
      await this.automaticReservesService.createFixedReservesForDate(date);

    return {
      success: true,
      date,
      dayOfWeek: date.getDay(),
      createdCount: createdReserves.length,
      reserves: createdReserves,
    };
  }

  @Post('create-for-range')
  @ApiOperation({
    summary: 'Crear reservas automáticas para un rango de fechas',
    description:
      'Crea las reservas automáticas para un período de tiempo. Útil para migraciones o recuperación de datos.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Reservas automáticas creadas exitosamente para el rango de fechas',
  })
  async createReservesForRange(
    @Body('startDate') startDateString: string,
    @Body('endDate') endDateString: string,
  ) {
    const startDate = this.parseDate(startDateString);
    const endDate = this.parseDate(endDateString);
    const results =
      await this.automaticReservesService.createFixedReservesForDateRange(
        startDate,
        endDate,
      );

    const totalCreated = results.reduce(
      (sum, day) => sum + day.createdCount,
      0,
    );

    return {
      success: true,
      startDate,
      endDate,
      totalDays: results.length,
      totalCreated,
      results,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de reservas automáticas',
    description: 'Devuelve estadísticas sobre las reservas automáticas creadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de reservas automáticas obtenidas exitosamente',
  })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.automaticReservesService.getAutomaticReservesStats(start, end);
  }

  @Get('test-cron')
  @ApiOperation({
    summary: 'Probar el cron job manualmente',
    description: 'Ejecuta el proceso del cron job para testing',
  })
  @ApiResponse({
    status: 200,
    description: 'Cron job ejecutado exitosamente',
  })
  async testCronJob() {
    return this.automaticReservesService.createDailyFixedReserves();
  }
  private parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(
        'Formato de fecha inválido. Use YYYY-MM-DD o formato ISO',
      );
    }
    return date;
  }
}
