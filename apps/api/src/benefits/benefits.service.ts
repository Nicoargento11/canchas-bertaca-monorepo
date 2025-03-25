import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Injectable()
export class BenefitService {
  constructor(private prisma: PrismaService) {}

  async create(createBenefitDto: CreateBenefitDto) {
    return this.prisma.benefit.create({
      data: createBenefitDto,
    });
  }

  async findAll() {
    return this.prisma.benefit.findMany();
  }

  async findOne(id: string) {
    return this.prisma.benefit.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateBenefitDto: UpdateBenefitDto) {
    return this.prisma.benefit.update({
      where: { id },
      data: updateBenefitDto,
    });
  }

  async remove(id: string) {
    return this.prisma.benefit.delete({
      where: { id },
    });
  }
}
