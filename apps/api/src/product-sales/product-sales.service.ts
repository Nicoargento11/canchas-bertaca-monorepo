import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductSaleDto } from './dto/create-product-sale.dto';
import { UpdateProductSaleDto } from './dto/update-product-sale.dto';

@Injectable()
export class ProductSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateProductSaleDto) {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verificar la reserva si está presente
    if (createDto.reserveId) {
      const reserve = await this.prisma.reserves.findUnique({
        where: { id: createDto.reserveId },
      });
      if (!reserve) {
        throw new NotFoundException('Reserve not found');
      }
    }

    // Crear la venta de producto
    const productSale = await this.prisma.productSale.create({
      data: {
        product: { connect: { id: createDto.productId } },
        Reserve: createDto.reserveId
          ? { connect: { id: createDto.reserveId } }
          : undefined,
        quantity: createDto.quantity,
        price: createDto.isGift ? 0 : createDto.price,
        discount: createDto.discount,
        isGift: createDto.isGift,
      },
      include: {
        product: true,
        Reserve: true,
      },
    });

    // Actualizar el stock del producto si no es un regalo
    if (!createDto.isGift) {
      await this.prisma.product.update({
        where: { id: createDto.productId },
        data: {
          stock: {
            decrement: createDto.quantity,
          },
        },
      });
    }

    return productSale;
  }

  async findAll() {
    return this.prisma.productSale.findMany({
      include: {
        product: true,
        Reserve: true,
      },
    });
  }

  async findOne(id: string) {
    const productSale = await this.prisma.productSale.findUnique({
      where: { id },
      include: {
        product: true,
        Reserve: true,
      },
    });

    if (!productSale) {
      throw new NotFoundException('Product sale not found');
    }

    return productSale;
  }

  async findByReserve(reserveId: string) {
    return this.prisma.productSale.findMany({
      where: { reserveId },
      include: {
        product: true,
      },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.productSale.findMany({
      where: { productId },
      include: {
        Reserve: true,
      },
    });
  }

  async update(id: string, updateDto: UpdateProductSaleDto) {
    // Verificar que existe
    const existingSale = await this.findOne(id);

    // Verificar el producto si se va a actualizar
    if (updateDto.productId && updateDto.productId !== existingSale.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateDto.productId },
      });
      if (!product) {
        throw new NotFoundException('New product not found');
      }
    }

    // Verificar la reserva si se va a actualizar
    if (updateDto.reserveId && updateDto.reserveId !== existingSale.reserveId) {
      const reserve = await this.prisma.reserves.findUnique({
        where: { id: updateDto.reserveId },
      });
      if (!reserve) {
        throw new NotFoundException('New reserve not found');
      }
    }

    return this.prisma.productSale.update({
      where: { id },
      data: updateDto,
      include: {
        product: true,
        Reserve: true,
      },
    });
  }

  async remove(id: string) {
    // Verificar que existe
    const productSale = await this.findOne(id);

    // Revertir el stock si no era un regalo
    if (!productSale.isGift) {
      await this.prisma.product.update({
        where: { id: productSale.productId },
        data: {
          stock: {
            increment: productSale.quantity,
          },
        },
      });
    }

    return this.prisma.productSale.delete({
      where: { id },
    });
  }

  async getTotalSalesByReserve(reserveId: string) {
    const sales = await this.findByReserve(reserveId);
    return sales.reduce((total, sale) => total + sale.price * sale.quantity, 0);
  }
}
