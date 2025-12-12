import { Injectable, ConflictException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  private async validateSchedule(
    complexId: string,
    courtId: string,
    scheduleDayId: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    // 1. Validación básica de formato y consistencia
    if (startTime === endTime) {
      throw new ConflictException(
        'La hora de inicio y fin no pueden ser iguales',
      );
    }

    // 2. Convertir horas a minutos para comparación
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStart = toMinutes(startTime);
    let newEnd = toMinutes(endTime);
    let crossesMidnight = false;
    if (newEnd < newStart) {
      // Cruza la medianoche, sumamos 24h a la hora de fin
      newEnd += 24 * 60;
      crossesMidnight = true;
    }

    // 3. Buscar horarios existentes para el mismo complejo, cancha y día
    const existingSchedules = await this.prisma.schedule.findMany({
      where: {
        complexId,
        courtId,
        scheduleDayId,
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // 4. Verificar superposición con cada horario existente
    for (const schedule of existingSchedules) {
      const existingStart = toMinutes(schedule.startTime);
      let existingEnd = toMinutes(schedule.endTime);
      let existingCrossesMidnight = false;
      if (existingEnd < existingStart) {
        existingEnd += 24 * 60;
        existingCrossesMidnight = true;
      }

      // Comprobamos superposición considerando ambos casos (cruza o no la medianoche)
      // Si ambos cruzan la medianoche, o solo uno, la lógica sigue funcionando
      const isOverlapping =
        (newStart < existingEnd && newEnd > existingStart) ||
        (crossesMidnight &&
          newStart < existingEnd - 24 * 60 &&
          newEnd > existingStart - 24 * 60) ||
        (existingCrossesMidnight &&
          newStart < existingEnd - 24 * 60 &&
          newEnd > existingStart - 24 * 60);

      if (isOverlapping) {
        throw new ConflictException(
          `Conflicto de horario: Se superpone con ${schedule.startTime}-${schedule.endTime}`,
        );
      }
    }
  }

  async create(createScheduleDto: CreateScheduleDto) {
    try {
      // Validación completa
      await this.validateSchedule(
        createScheduleDto.complexId,
        createScheduleDto.courtId,
        createScheduleDto.scheduleDayId,
        createScheduleDto.startTime,
        createScheduleDto.endTime,
      );

      // Creación del horario
      return await this.prisma.schedule.create({
        data: {
          startTime: createScheduleDto.startTime,
          endTime: createScheduleDto.endTime,
          scheduleDayId: createScheduleDto.scheduleDayId,
          courtId: createScheduleDto.courtId,
          complexId: createScheduleDto.complexId,
          sportTypeId: createScheduleDto.sportTypeId,
          rates: {
            connect: { id: createScheduleDto.rateId },
          },
        },
        include: {
          rates: true,
          scheduleDay: true,
          court: { include: { sportType: true } },
        },
      });
    } catch (error) {
      // Manejo específico de errores de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El horario ya existe');
        }
        if (error.code === 'P2025') {
          throw new ConflictException('Cancha o día no encontrado');
        }
      }
      throw error;
    }
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    try {
      // Obtener el horario existente para validar el complejo si no viene en el DTO
      const existingSchedule = await this.prisma.schedule.findUnique({
        where: { id },
        select: { complexId: true, courtId: true, scheduleDayId: true },
      });

      if (!existingSchedule) {
        throw new ConflictException('Horario no encontrado');
      }

      // Validación con el complejo existente (o el nuevo si se cambia)
      const complexId =
        updateScheduleDto.complexId || existingSchedule.complexId;
      const courtId = updateScheduleDto.courtId || existingSchedule.courtId;
      const scheduleDayId =
        updateScheduleDto.scheduleDayId || existingSchedule.scheduleDayId;

      await this.validateSchedule(
        complexId,
        courtId,
        scheduleDayId,
        updateScheduleDto.startTime,
        updateScheduleDto.endTime,
        id,
      );

      // Actualización del horario
      return await this.prisma.schedule.update({
        where: { id },
        data: {
          startTime: updateScheduleDto.startTime,
          endTime: updateScheduleDto.endTime,
          scheduleDayId,
          courtId,
          complexId,
          sportTypeId: updateScheduleDto.sportTypeId,
          rates: updateScheduleDto.rateId
            ? {
                set: [], // TODO: temporal para evitar conflictos
                connect: { id: updateScheduleDto.rateId },
              }
            : undefined,
        },
        include: {
          rates: true,
          scheduleDay: true,
          court: true,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Error al actualizar el horario');
    }
  }

  // ... (findAll, findOne y remove permanecen igual)

  async findByComplex(complexId: string) {
    return this.prisma.schedule.findMany({
      where: { complexId },
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: { rates: true, scheduleDay: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.schedule.delete({
      where: { id },
      include: { sportType: true, court: true },
    });
  }
}
