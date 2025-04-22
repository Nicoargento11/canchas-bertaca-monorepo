import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';

@Injectable()
export class InventoryMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateInventoryMovementDto) {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Crear el movimiento
    const movement = await this.prisma.inventoryMovement.create({
      data: {
        productId: createDto.productId, // Usamos el campo directo
        quantity: createDto.quantity,
        type: createDto.type,
        reason: createDto.reason,
        documentNumber: createDto.documentNumber,
      },
      include: { product: true },
    });

    // Actualizar el stock del producto
    await this.updateProductStock(movement);

    return movement;
  }

  private async updateProductStock(movement: {
    productId: string;
    quantity: number;
    type: MovementType;
  }) {
    const quantity =
      movement.type === 'VENTA' || movement.type === 'PERDIDA'
        ? -movement.quantity
        : movement.quantity;

    await this.prisma.product.update({
      where: { id: movement.productId },
      data: {
        stock: {
          [quantity > 0 ? 'increment' : 'decrement']: Math.abs(
            movement.quantity,
          ),
        },
      },
    });
  }

  async findAll() {
    return this.prisma.inventoryMovement.findMany({
      include: { product: true },
    });
  }

  async findOne(id: string) {
    const movement = await this.prisma.inventoryMovement.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!movement) {
      throw new NotFoundException('Inventory movement not found');
    }

    return movement;
  }

  async findByProduct(productId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { productId },
      include: { product: true },
    });
  }

  async update(id: string, updateDto: UpdateInventoryMovementDto) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.inventoryMovement.update({
      where: { id },
      data: updateDto,
      include: { product: true },
    });
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    return this.prisma.inventoryMovement.delete({
      where: { id },
    });
  }
}
