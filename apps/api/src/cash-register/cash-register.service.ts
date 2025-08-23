// src/cash-register/cash-register.service.ts
import { Injectable } from '@nestjs/common';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CashRegisterService {
  constructor(private prisma: PrismaService) {}

  async create(createCashRegisterDto: CreateCashRegisterDto) {
    return this.prisma.cashRegister.create({
      data: {
        ...createCashRegisterDto,
        isActive: createCashRegisterDto.isActive ?? true,
      },
    });
  }

  async findAll(complexId: string) {
    return this.prisma.cashRegister.findMany({
      where: { complexId },
    });
  }

  async findOne(id: string) {
    return this.prisma.cashRegister.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCashRegisterDto: UpdateCashRegisterDto) {
    return this.prisma.cashRegister.update({
      where: { id },
      data: updateCashRegisterDto,
    });
  }

  async remove(id: string) {
    return this.prisma.cashRegister.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
