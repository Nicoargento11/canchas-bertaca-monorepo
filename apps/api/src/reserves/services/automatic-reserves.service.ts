import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutomaticReservesService {
  private readonly logger = new Logger(AutomaticReservesService.name);

  constructor(private readonly prisma: PrismaService) {}
  /**
   * Convierte una fecha a UTC manteniendo solo año, mes y día
   * Para consistencia con cómo se guardan las fechas en la BD
   */
  private toUTCDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
  }
  /**
   * Calcula la duración en horas entre dos horarios
   */
  private calculateHoursDuration(startTime: string, endTime: string): number {
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);

    // Manejar cruces de medianoche
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Agregar 24 horas
    }

    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes / 60; // Convertir a horas
  }

  /**
   * Cron job que se ejecuta todos los días a las 00:01
   * para crear las reservas automáticas de los turnos fijos
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async createDailyFixedReserves() {
    this.logger.log('Iniciando creación de reservas automáticas...');

    try {
      const today = new Date();
      const dayOfWeek = today.getDay();

      const createdReserves = await this.createFixedReservesForDay(
        today,
        dayOfWeek,
      );

      this.logger.log(
        `Proceso completado. Se crearon ${createdReserves.length} reservas automáticas para el día ${today.toDateString()}`,
      );

      return {
        success: true,
        date: today,
        createdCount: createdReserves.length,
        reserves: createdReserves,
      };
    } catch (error) {
      this.logger.error('Error al crear reservas automáticas:', error);
      throw error;
    }
  }

  /**
   * Método público para crear reservas manualmente (útil para testing)
   */
  async createFixedReservesForDate(date: Date) {
    const dayOfWeek = date.getDay();
    return this.createFixedReservesForDay(date, dayOfWeek);
  }

  /**
   * Crea todas las reservas fijas para un día específico
   */
  private async createFixedReservesForDay(date: Date, dayOfWeek: number) {
    // Obtener todas las reservas fijas activas para este día de la semana
    const fixedReserves = await this.prisma.fixedReserve.findMany({
      where: {
        isActive: true,
        scheduleDay: {
          dayOfWeek: dayOfWeek,
          isActive: true,
        },
      },
      include: {
        user: true,
        court: true,
        rate: true,
        complex: true,
        scheduleDay: true,
      },
    });

    this.logger.log(
      `Encontradas ${fixedReserves.length} reservas fijas para el día ${dayOfWeek} (${date.toDateString()})`,
    );

    const createdReserves = [];

    for (const fixedReserve of fixedReserves) {
      try {
        // Verificar si ya existe una reserva para esta fecha y horario
        const targetDate = this.toUTCDate(date);
        const existingReserve = await this.prisma.reserve.findFirst({
          where: {
            date: targetDate,
            schedule: `${fixedReserve.startTime} - ${fixedReserve.endTime}`,
            courtId: fixedReserve.courtId,
            fixedReserveId: fixedReserve.id,
          },
        });

        if (existingReserve) {
          this.logger.debug(
            `Ya existe una reserva para la reserva fija ${fixedReserve.id} en la fecha ${date.toDateString()}`,
          );
          continue;
        }

        // Calcular precio basado en las horas de duración
        const durationHours = this.calculateHoursDuration(
          fixedReserve.startTime,
          fixedReserve.endTime,
        );
        const totalPrice = fixedReserve.rate.price * durationHours;
        // const totalReservationAmount =
        //   fixedReserve.rate.reservationAmount * durationHours;

        // Crear la reserva automática
        const newReserve = await this.prisma.reserve.create({
          data: {
            date: this.toUTCDate(date),
            schedule: `${fixedReserve.startTime} - ${fixedReserve.endTime}`,
            price: totalPrice,
            reservationAmount: 0,
            status: 'APROBADO', // Las reservas fijas se aprueban automáticamente
            phone: fixedReserve.user.phone || '',
            clientName: fixedReserve.user.name,
            reserveType: 'FIJO',
            courtId: fixedReserve.courtId,
            userId: fixedReserve.userId,
            complexId: fixedReserve.complexId,
            fixedReserveId: fixedReserve.id,
          },
          include: {
            court: true,
            user: true,
            complex: true,
            fixedReserve: true,
          },
        });

        createdReserves.push(newReserve);

        this.logger.debug(
          `Reserva automática creada: ${newReserve.id} para ${fixedReserve.user.name} en cancha ${fixedReserve.court.name} (${fixedReserve.startTime} - ${fixedReserve.endTime}) - ${durationHours}h - $${totalPrice}`,
        );
      } catch (error) {
        this.logger.error(
          `Error al crear reserva automática para la reserva fija ${fixedReserve.id}:`,
          error,
        );
        // Continuamos con las demás reservas aunque una falle
      }
    }

    return createdReserves;
  }

  /**
   * Método para crear reservas fijas de días pasados (útil para migration)
   */
  async createFixedReservesForDateRange(startDate: Date, endDate: Date) {
    const results = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const createdReserves = await this.createFixedReservesForDay(
        new Date(currentDate),
        dayOfWeek,
      );

      results.push({
        date: new Date(currentDate),
        dayOfWeek,
        createdCount: createdReserves.length,
        reserves: createdReserves,
      });

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  /**
   * Obtiene estadísticas de reservas automáticas creadas
   */
  async getAutomaticReservesStats(startDate?: Date, endDate?: Date) {
    const whereCondition: any = {
      reserveType: 'FIJO',
      fixedReserveId: { not: null },
    };

    if (startDate || endDate) {
      whereCondition.date = {};
      if (startDate) whereCondition.date.gte = startDate;
      if (endDate) whereCondition.date.lte = endDate;
    }
    const [totalCount, byComplex, byStatus] = await Promise.all([
      this.prisma.reserve.count({ where: whereCondition }),

      this.prisma.reserve.groupBy({
        by: ['complexId'],
        where: whereCondition,
        _count: { id: true },
      }),

      this.prisma.reserve.groupBy({
        by: ['status'],
        where: whereCondition,
        _count: { id: true },
      }),
    ]);

    return {
      totalCount,
      byComplex,
      byStatus,
      dateRange: { startDate, endDate },
    };
  }
}
