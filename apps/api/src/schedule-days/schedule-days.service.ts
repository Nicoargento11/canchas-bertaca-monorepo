import { Injectable } from '@nestjs/common';
import { CreateScheduleDayDto } from './dto/create-schedule-day.dto';
import { UpdateScheduleDayDto } from './dto/update-schedule-day.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Court,
  FixedReserve,
  Rate,
  Schedule,
  ScheduleDay,
  User,
} from '@prisma/client';

export type ScheduleDayWithRelations = ScheduleDay & {
  fixedReserves: (FixedReserve & {
    user: User;
    court: Court;
  })[];
  schedules: (Schedule & {
    rates: Rate[];
  })[];
};
@Injectable()
export class ScheduleDayService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDayDto: CreateScheduleDayDto) {
    return this.prisma.scheduleDay.create({
      data: createScheduleDayDto,
    });
  }

  async findAll() {
    return this.prisma.scheduleDay.findMany({
      include: { schedules: { include: { rates: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.scheduleDay.findUnique({
      where: { id },
      include: { fixedReserves: true },
    });
  }

  async findByDay(
    dayOfWeek: number,
    complexId: string,
    sportTypeId: string,
  ): Promise<ScheduleDayWithRelations | null> {
    return this.prisma.scheduleDay.findFirst({
      where: { dayOfWeek, complexId },
      include: {
        fixedReserves: {
          include: { user: true, court: true },
          where: { court: { sportTypeId } },
        },
        schedules: {
          where: { sportTypeId },
          include: { rates: true },
        },
      },
    });
  }

  async update(id: string, updateScheduleDayDto: UpdateScheduleDayDto) {
    return this.prisma.scheduleDay.update({
      where: { id },
      data: updateScheduleDayDto,
    });
  }

  async remove(id: string) {
    return this.prisma.scheduleDay.delete({
      where: { id },
    });
  }

  async ensureScheduleDaysExist(complexId: string): Promise<void> {
    const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

    // Obtener los días que ya existen
    const existingDays = await this.prisma.scheduleDay.findMany({
      where: { complexId },
      select: { dayOfWeek: true },
    });

    const existingDayNumbers = existingDays.map((d) => d.dayOfWeek);

    // Encontrar los días que faltan
    const missingDays = DAYS_OF_WEEK.filter(
      (day) => !existingDayNumbers.includes(day),
    );

    // Si no faltan días, retornar
    if (missingDays.length === 0) {
      return;
    }

    // Crear solo los días faltantes
    await this.prisma.scheduleDay.createMany({
      data: missingDays.map((dayOfWeek) => ({
        dayOfWeek,
        isActive: false,
        complexId,
      })),
      skipDuplicates: true,
    });
  }

  async getScheduleDays(complexId: string) {
    // Asegurar que existan los días antes de devolverlos
    await this.ensureScheduleDaysExist(complexId);

    return this.prisma.scheduleDay.findMany({
      where: { complexId },
      orderBy: { dayOfWeek: 'asc' },
      include: {
        schedules: true,
        fixedReserves: true,
      },
    });
  }
}
