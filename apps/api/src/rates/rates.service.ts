import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';

@Injectable()
export class RateService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rate.findMany();
  }

  async findById(id: string) {
    const rate = await this.prisma.rate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException();
    return rate;
  }

  async create(createRateDto: CreateRateDto) {
    try {
      return await this.prisma.rate.create({ data: createRateDto });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una tarifa con este nombre');
      }
      throw error;
    }
  }

  async update(id: string, updateRateDto: UpdateRateDto) {
    try {
      return await this.prisma.rate.update({
        where: { id },
        data: updateRateDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.rate.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
