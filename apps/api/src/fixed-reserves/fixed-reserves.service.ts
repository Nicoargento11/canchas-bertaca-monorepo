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
import { FixedReserve, Status } from '@prisma/client';

@Injectable()
export class FixedReservesService {
  private readonly logger = new Logger(FixedReservesService.name);

  constructor(private readonly prisma: PrismaService) { }
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

    // Validar si coincide con hoy y hay reservas existentes
    const today = new Date();
    const todayDayOfWeek = today.getDay();

    if (scheduleDay.dayOfWeek === todayDayOfWeek) {
      await this.validateNoOverlap(courtId, today, startTime, endTime);
    }

    const fixedReserve = await this.prisma.fixedReserve.create({
      data: createFixedReserveDto,
      include: {
        scheduleDay: true,
        user: true,
        court: true,
        rate: true,
        complex: true,
        promotion: true,
      },
    });

    this.logger.log(`Reserva fija creada: ${fixedReserve.id}`);

    // 2. Verificar si coincide con el día de hoy
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

  async findAll(
    complexId?: string,
    dayOfWeek?: number,
  ): Promise<FixedReserve[]> {
    const where: any = {};

    if (complexId) {
      where.scheduleDay = {
        complexId,
      };
    }

    if (dayOfWeek !== undefined) {
      where.scheduleDay = {
        ...where.scheduleDay,
        dayOfWeek,
      };
    }

    return await this.prisma.fixedReserve.findMany({
      where,
      include: {
        scheduleDay: true,
        user: true,
        court: true,
        rate: true,
      },
    });
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
      // 1. Actualizar la reserva fija
      const updatedFixedReserve = await this.prisma.fixedReserve.update({
        where: { id },
        data: updateFixedReserveDto,
        include: { rate: true },
      });

      // 2. Actualizar instancias futuras (incluyendo hoy) que no se hayan jugado
      const today = new Date();
      const targetDate = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
      );

      const pendingReserves = await this.prisma.reserve.findMany({
        where: {
          fixedReserveId: id,
          date: { gte: targetDate },
          status: { notIn: ['COMPLETADO', 'CANCELADO'] },
        },
      });

      for (const reserve of pendingReserves) {
        // Recalcular precio
        const duration = this.calculateHoursDuration(
          updatedFixedReserve.startTime,
          updatedFixedReserve.endTime,
        );
        const newPrice = updatedFixedReserve.rate.price * duration;

        await this.prisma.reserve.update({
          where: { id: reserve.id },
          data: {
            schedule: `${updatedFixedReserve.startTime} - ${updatedFixedReserve.endTime}`,
            courtId: updatedFixedReserve.courtId,
            price: newPrice,
            // Si cambió el usuario en el fijo, también deberíamos actualizarlo en la reserva?
            // updateFixedReserveDto.userId ? { userId: ... } : undefined
            userId: updatedFixedReserve.userId,
            clientName: (
              await this.prisma.user.findUnique({
                where: { id: updatedFixedReserve.userId },
              })
            ).name,
          },
        });
        this.logger.log(
          `Instancia de reserva ${reserve.id} actualizada por cambios en el fijo ${id}`,
        );
      }

      return updatedFixedReserve;
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
    const fixedReserve = await this.prisma.fixedReserve.findUnique({
      where: { id },
      include: {
        scheduleDay: true,
        user: true,
        court: true,
        rate: true,
        complex: true,
      },
    });

    if (!fixedReserve) {
      throw new NotFoundException(`FixedReserve with ID ${id} not found`);
    }

    const newStatus = !fixedReserve.isActive;

    const updated = await this.prisma.fixedReserve.update({
      where: { id },
      data: { isActive: newStatus },
    });

    const today = new Date();
    const todayDayOfWeek = today.getDay();

    if (newStatus) {
      // Activating
      if (fixedReserve.scheduleDay.dayOfWeek === todayDayOfWeek) {
        this.logger.log(
          `Reserva fija ${id} activada y coincide con hoy. Creando instancia...`,
        );
        try {
          await this.createTodayReserveInstance(fixedReserve, today);
        } catch (error) {
          this.logger.warn(
            `No se pudo crear la instancia al activar: ${error.message}`,
          );
        }
      }
    } else {
      // Deactivating
      this.logger.log(
        `Reserva fija ${id} desactivada. Eliminando instancias futuras/hoy...`,
      );
      // Eliminar la instancia de hoy si existe (y quizás futuras si se generaron)
      // Asumimos que solo se genera la de hoy por el cron o creación
      const targetDate = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
      );

      await this.prisma.reserve.deleteMany({
        where: {
          fixedReserveId: id,
          date: {
            gte: targetDate, // Hoy o futuro
          },
          status: {
            not: 'COMPLETADO', // Opcional: no borrar si ya se jugó?
          },
        },
      });
    }

    return updated;
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
    let pricePerHour = fixedReserve.rate.price;

    // Aplicar descuento de promoción si existe y está activa
    if (fixedReserve.promotion && fixedReserve.promotion.isActive) {
      if (fixedReserve.promotion.type === 'PERCENTAGE_DISCOUNT') {
        const discountPercent = fixedReserve.promotion.value || 0;
        this.logger.log(
          `Aplicando descuento de ${discountPercent}% a reserva fija ${fixedReserve.id}`,
        );
        pricePerHour = pricePerHour * (1 - discountPercent / 100);
      }
    }

    const totalPrice = pricePerHour * durationHours;

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
        promotionId: fixedReserve.promotionId, // Pass promotion to reserve
      },
    });

    this.logger.log(
      `✅ Reserva automática creada: ${newReserve.id} para reserva fija ${fixedReserve.id} - ${fixedReserve.startTime} a ${fixedReserve.endTime} - Precio: $${totalPrice}${fixedReserve.promotion ? ` (con ${fixedReserve.promotion.name})` : ''}`,
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

  private async validateNoOverlap(
    courtId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const targetDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );

    const reserves = await this.prisma.reserve.findMany({
      where: {
        courtId,
        date: targetDate,
        status: {
          notIn: [Status.CANCELADO, Status.RECHAZADO],
        },
      },
    });

    const newStart = this.timeToMinutes(startTime);
    let newEnd = this.timeToMinutes(endTime);

    if (newEnd <= newStart) {
      newEnd += 24 * 60;
    }

    for (const reserve of reserves) {
      const [rStartStr, rEndStr] = reserve.schedule.split(' - ');
      const rStart = this.timeToMinutes(rStartStr);
      let rEnd = this.timeToMinutes(rEndStr);

      if (rEnd <= rStart) {
        rEnd += 24 * 60;
      }

      // Check overlap: (StartA < EndB) and (EndA > StartB)
      if (newStart < rEnd && newEnd > rStart) {
        throw new ConflictException(
          `Ya existe una reserva (${reserve.status}) en el horario ${reserve.schedule} para el día de hoy.`,
        );
      }
    }
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
