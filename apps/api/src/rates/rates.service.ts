// src/rates/rate.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';

@Injectable()
export class RatesService {
  constructor(private prisma: PrismaService) {}

  async create(createRateDto: CreateRateDto) {
    return this.prisma.rate.create({
      data: createRateDto,
    });
  }

  async findAll() {
    return this.prisma.rate.findMany();
  }

  async findOne(id: string) {
    return this.prisma.rate.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateRateDto: UpdateRateDto) {
    return this.prisma.rate.update({
      where: { id },
      data: updateRateDto,
    });
  }

  async remove(id: string) {
    return this.prisma.rate.delete({
      where: { id },
    });
  }
}
