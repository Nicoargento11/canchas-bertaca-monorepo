// src/unavailable-days/unavailable-day.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnavailableDayDto } from './dto/create-unavailable-day.dto';
import { UpdateUnavailableDayDto } from './dto/update-unavailable-day.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Injectable()
export class UnavailableDayService {
  constructor(private prisma: PrismaService) { }

  async create(createUnavailableDayDto: CreateUnavailableDayDto) {
    return this.prisma.unavailableDay.create({
      data: createUnavailableDayDto,
    });
  }

  @Public()
  async findAll(complexId?: string) {
    return this.prisma.unavailableDay.findMany({
      where: {
        complexId,
      },
      include: {
        court: true,
        complex: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.unavailableDay.findUnique({
      where: { id },
      include: {
        court: true,
        complex: true,
      },
    });
  }

  async update(id: string, updateUnavailableDayDto: UpdateUnavailableDayDto) {
    return this.prisma.unavailableDay.update({
      where: { id },
      data: updateUnavailableDayDto,
    });
  }

  async remove(id: string) {
    return this.prisma.unavailableDay.delete({
      where: { id },
    });
  }

  async removeByDate(date: Date, complexId?: string, courtId?: string) {
    // Buscar primero el registro que coincide
    const unavailableDay = await this.prisma.unavailableDay.findFirst({
      where: {
        date,
        complexId: complexId ?? null,
        courtId: courtId ?? null,
      },
    });

    if (!unavailableDay) {
      return null;
    }

    return this.prisma.unavailableDay.delete({
      where: { id: unavailableDay.id },
    });
  }
}
