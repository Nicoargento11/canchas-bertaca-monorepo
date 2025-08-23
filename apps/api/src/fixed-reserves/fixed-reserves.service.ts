// src/fixed-reserves/fixed-reserves.service.ts
import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFixedReserveDto } from './dto/create-fixed-reserve.dto';
import { UpdateFixedReserveDto } from './dto/update-fixed-reserve.dto';
import { FixedReserve } from '@prisma/client';

@Injectable()
export class FixedReservesService {
  private readonly logger = new Logger(FixedReservesService.name);

  constructor(private readonly prisma: PrismaService) {}
  async create(
    createFixedReserveDto: CreateFixedReserveDto,
  ): Promise<FixedReserve> {
    // 1. Crear la reserva fija

    const { courtId, scheduleDayId, startTime, endTime } =
      createFixedReserveDto;

    const scheduleDay = await this.prisma.scheduleDay.findUnique({
      where: { id: scheduleDayId },
    });
    // Buscar si existe algún turno fijo solapado
    const overlapping = await this.prisma.fixedReserve.findFirst({
      where: {
        courtId,
        scheduleDayId: scheduleDay.id,
        // Solapamiento de horarios
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'Ya existe un turno fijo solapado para esa cancha, día y horario.',
      );
    }
    const fixedReserve = await this.prisma.fixedReserve.create({
      data: createFixedReserveDto,
      include: {
        scheduleDay: true,
        user: true,
        court: true,
        rate: true,
        complex: true,
      },
    });

    this.logger.log(`Reserva fija creada: ${fixedReserve.id}`);

    // 2. Verificar si coincide con el día de hoy
    const today = new Date();
    const todayDayOfWeek = today.getDay();

    if (
      fixedReserve.scheduleDay.dayOfWeek === todayDayOfWeek &&
      fixedReserve.isActive
    ) {
      this.logger.log(
        `La reserva fija ${fixedReserve.id} coincide con hoy (día ${todayDayOfWeek}). Creando instancia de reserva...`,
      );

      try {
        await this.createTodayReserveInstance(fixedReserve, today);
      } catch (error) {
        this.logger.warn(
          `No se pudo crear la instancia de reserva para hoy: ${error.message}`,
        );
        // No lanzamos el error para no afectar la creación de la reserva fija
      }
    }

    return fixedReserve;
  }

  async findAll(): Promise<FixedReserve[]> {
    return await this.prisma.fixedReserve.findMany();
  }

  async findOne(id: string): Promise<FixedReserve> {
    const fixedReserve = await this.prisma.fixedReserve.findUnique({
      where: { id },
    });

    if (!fixedReserve) {
      throw new NotFoundException(`FixedReserve with ID ${id} not found`);
    }

    return fixedReserve;
  }

  async update(
    id: string,
    updateFixedReserveDto: UpdateFixedReserveDto,
  ): Promise<FixedReserve> {
    try {
      return await this.prisma.fixedReserve.update({
        where: { id },
        data: updateFixedReserveDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`FixedReserve with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.fixedReserve.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`FixedReserve with ID ${id} not found`);
      }
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<FixedReserve> {
    const fixedReserve = await this.findOne(id);
    if (!fixedReserve) {
      throw new NotFoundException(`FixedReserve with ID ${id} not found`);
    }
    return await this.prisma.fixedReserve.update({
      where: { id },
      data: { isActive: !fixedReserve.isActive },
    });
  }

  /**
   * Crea una instancia de reserva para hoy basada en una reserva fija
   */
  private async createTodayReserveInstance(
    fixedReserve: any,
    date: Date,
  ): Promise<void> {
    // Convertir la fecha a UTC manteniendo solo año, mes y día
    const targetDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );

    // Verificar si ya existe una reserva para esta fecha y horario
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
      return;
    }

    // Calcular precio basado en las horas de duración
    const durationHours = this.calculateHoursDuration(
      fixedReserve.startTime,
      fixedReserve.endTime,
    );
    const totalPrice = fixedReserve.rate.price * durationHours;

    // Crear la reserva automática
    const newReserve = await this.prisma.reserve.create({
      data: {
        date: targetDate,
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
    });

    this.logger.log(
      `✅ Reserva automática creada: ${newReserve.id} para reserva fija ${fixedReserve.id} - ${fixedReserve.startTime} a ${fixedReserve.endTime}`,
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
}
