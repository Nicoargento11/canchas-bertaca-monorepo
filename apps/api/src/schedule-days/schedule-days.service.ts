import { Injectable } from '@nestjs/common';
import { CreateScheduleDayDto } from './dto/create-schedule-day.dto';
import { UpdateScheduleDayDto } from './dto/update-schedule-day.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
      include: { FixedSchedule: true },
    });
  }

  async findByDay(dayOfWeek: number) {
    return this.prisma.scheduleDay.findFirst({
      where: { dayOfWeek },
      include: {
        FixedSchedule: { include: { user: true } },
        schedules: { include: { rates: true } },
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
}
