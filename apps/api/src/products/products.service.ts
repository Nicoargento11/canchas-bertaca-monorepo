import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(complexId?: string) {
    return this.prisma.product.findMany({
      where: complexId ? { complexId } : {},
      include: {
        complex: true,
      },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        complex: true,
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        complex: true,
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      // Verificar que el complex existe
      const complexExists = await this.prisma.complex.findUnique({
        where: { id: createProductDto.complexId },
      });
      if (!complexExists) {
        throw new NotFoundException('Complejo no encontrado');
      }

      return await this.prisma.product.create({
        data: {
          ...createProductDto,
          category: createProductDto.category as ProductCategory,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('barcode')) {
          throw new ConflictException(
            'Ya existe un producto con este código de barras',
          );
        }
        throw new ConflictException('Error de duplicación en producto');
      }
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      if (updateProductDto.complexId) {
        const complexExists = await this.prisma.complex.findUnique({
          where: { id: updateProductDto.complexId },
        });
        if (!complexExists) {
          throw new NotFoundException('Complejo no encontrado');
        }
      }

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          category: updateProductDto.category as ProductCategory,
        },
        include: {
          complex: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Producto no encontrado');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Error de duplicación en producto');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Producto no encontrado');
      }
      throw error;
    }
  }

  async updateStock(id: string, quantity: number) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Producto no encontrado');

      return await this.prisma.product.update({
        where: { id },
        data: {
          stock: product.stock + quantity,
        },
        include: {
          complex: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Producto no encontrado');
      }
      throw error;
    }
  }

  async getLowStockProducts(threshold?: number) {
    const minStockThreshold = threshold ?? undefined;

    const whereCondition: any = {
      stock: {
        lte: minStockThreshold ?? undefined,
      },
    };

    if (minStockThreshold === undefined) {
      whereCondition.stock = {
        lte: this.prisma.product.fields.minStock,
      };
    }

    return this.prisma.product.findMany({
      where: whereCondition,
      include: {
        complex: true,
      },
    });
  }
}
