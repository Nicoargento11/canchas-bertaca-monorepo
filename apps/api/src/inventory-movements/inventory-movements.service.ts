import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';

@Injectable()
export class InventoryMovementService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryMovementDto: CreateInventoryMovementDto) {
    return this.prisma.inventoryMovement.create({
      data: createInventoryMovementDto,
    });
  }

  async findAll() {
    return this.prisma.inventoryMovement.findMany({
      include: {
        product: true,
        complex: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.inventoryMovement.findUnique({
      where: { id },
      include: {
        product: true,
        complex: true,
      },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { productId },
      include: {
        product: true,
        complex: true,
      },
    });
  }

  async findByComplex(complexId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { complexId },
      include: {
        product: true,
        complex: true,
      },
    });
  }

  async update(
    id: string,
    updateInventoryMovementDto: UpdateInventoryMovementDto,
  ) {
    return this.prisma.inventoryMovement.update({
      where: { id },
      data: updateInventoryMovementDto,
    });
  }

  async remove(id: string) {
    return this.prisma.inventoryMovement.delete({
      where: { id },
    });
  }

  async filter(params: {
    type?: MovementType;
    productId?: string;
    complexId?: string;
  }) {
    return this.prisma.inventoryMovement.findMany({
      where: {
        type: params.type,
        productId: params.productId,
        complexId: params.complexId,
      },
      include: {
        product: true,
        complex: true,
      },
    });
  }
}
