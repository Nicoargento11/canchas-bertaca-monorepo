import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        startTime: createScheduleDto.startTime,
        endTime: createScheduleDto.endTime,
        scheduleDay: {
          connect: { dayOfWeek: createScheduleDto.scheduleDay },
        },
        rates: createScheduleDto.rates
          ? {
              connect: Array.isArray(createScheduleDto.rates)
                ? createScheduleDto.rates.map((rateId) => ({ id: rateId })) // Muchas tarifas
                : { id: createScheduleDto.rates }, // Una sola tarifa
            }
          : undefined,
        benefits: createScheduleDto.benefits
          ? {
              connect: createScheduleDto.benefits.map((benefitId) => ({
                id: benefitId,
              })),
            }
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: { rates: true, benefits: true, scheduleDay: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    return this.prisma.schedule.update({
      where: { id },
      data: {
        startTime: updateScheduleDto.startTime,
        endTime: updateScheduleDto.endTime,
        scheduleDay: {
          connect: { dayOfWeek: updateScheduleDto.scheduleDay },
        },
        rates: updateScheduleDto.rates
          ? {
              connect: Array.isArray(updateScheduleDto.rates)
                ? updateScheduleDto.rates.map((rateId) => ({ id: rateId })) // Muchas tarifas
                : { id: updateScheduleDto.rates }, // Una sola tarifa
            }
          : undefined,
        benefits: updateScheduleDto.benefits
          ? {
              connect: updateScheduleDto.benefits.map((benefitId) => ({
                id: benefitId,
              })),
            }
          : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}
