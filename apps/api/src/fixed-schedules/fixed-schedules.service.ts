// backend/src/fixed-schedules/fixed-schedules.service.ts
import { Injectable } from '@nestjs/common';
import { CreateFixedScheduleDto } from './dto/create-fixed-schedule.dto';
import { UpdateFixedScheduleDto } from './dto/update-fixed-schedule.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FixedSchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(createFixedScheduleDto: CreateFixedScheduleDto) {
    return this.prisma.fixedSchedule.create({
      data: {
        ...createFixedScheduleDto,
        scheduleDay: {
          connect: { dayOfWeek: createFixedScheduleDto.scheduleDay },
        },
        rate: {
          connect: { id: createFixedScheduleDto.rate },
        },
        user: {
          connect: { id: createFixedScheduleDto.user },
        },
        isActive: createFixedScheduleDto.isActive ?? true, // Por defecto true
      },
    });
  }

  async findAll() {
    return this.prisma.fixedSchedule.findMany({
      include: {
        scheduleDay: true,
        rate: true,
        reserves: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.fixedSchedule.findUnique({
      where: { id },
      include: {
        scheduleDay: true,
        rate: true,
        reserves: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, updateFixedScheduleDto: UpdateFixedScheduleDto) {
    return this.prisma.fixedSchedule.update({
      where: { id },
      data: {
        ...updateFixedScheduleDto,
        scheduleDay: {
          connect: { dayOfWeek: updateFixedScheduleDto.scheduleDay },
        },
        rate: {
          connect: { id: updateFixedScheduleDto.rate },
        },
        user: {
          connect: { id: updateFixedScheduleDto.user },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.fixedSchedule.delete({
      where: { id },
    });
  }

  async toggle(id: string, isActive: boolean) {
    return this.prisma.fixedSchedule.update({
      where: { id },
      data: { isActive },
    });
  }
}
