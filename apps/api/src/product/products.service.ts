// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        isActive: createProductDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(
    id: string,
    quantity: number,
    operation: 'increment' | 'decrement' | 'set',
  ) {
    await this.findOne(id); // Verifica que exista

    const updateData = {
      increment: { stock: quantity },
      decrement: { stock: quantity },
      set: { stock: quantity },
    }[operation];

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async findByCategory(category: ProductCategory) {
    return this.prisma.product.findMany({
      where: { category, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
