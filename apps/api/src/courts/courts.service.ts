import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { QueryCourtDto } from './dto/query-court.dto';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(createCourtDto: CreateCourtDto) {
    return this.prisma.court.create({
      data: {
        ...createCourtDto,
        characteristics: createCourtDto.characteristics,
      },
    });
  }

  async findAll(query: QueryCourtDto) {
    const where: any = {};

    if (query.complexId) where.complexId = query.complexId;
    if (query.sportTypeId) where.sportTypeId = query.sportTypeId;
    if (typeof query.isActive !== 'undefined') where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const courts = await this.prisma.court.findMany({
      where,
      orderBy: { courtNumber: 'asc' },
      include: {
        schedules: true,
      },
    });

    return courts;
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({
      where: { id },
    });

    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    return court;
  }

  async update(id: string, updateCourtDto: UpdateCourtDto) {
    const existingCourt = await this.prisma.court.findUnique({ where: { id } });
    if (!existingCourt) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    const court = await this.prisma.court.update({
      where: { id },
      data: {
        ...updateCourtDto,
        characteristics: updateCourtDto.characteristics
          ? updateCourtDto.characteristics
          : undefined,
      },
    });

    return court;
  }

  async toggleStatus(id: string) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    const updatedCourt = await this.prisma.court.update({
      where: { id },
      data: { isActive: !court.isActive },
    });

    return updatedCourt;
  }

  async remove(id: string): Promise<void> {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    await this.prisma.court.delete({ where: { id } });
  }
}
