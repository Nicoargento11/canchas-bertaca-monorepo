import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProductSaleDto } from './dto/create-product-sale.dto';
import { UpdateProductSaleDto } from './dto/update-product-sale.dto';
import { ProductSale } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductSaleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductSaleDto: CreateProductSaleDto,
  ): Promise<ProductSale> {
    return this.prisma.$transaction(async (prisma) => {
      const product = await prisma.product.findUnique({
        where: { id: createProductSaleDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createProductSaleDto.productId} not found`,
        );
      }

      // Validar que el producto pertenezca al complejo de la venta
      if (product.complexId !== createProductSaleDto.complexId) {
        throw new ConflictException(
          'El producto no pertenece al complejo indicado en la venta',
        );
      }

      if (product.stock < createProductSaleDto.quantity) {
        throw new ConflictException('Not enough stock available');
      }

      // Crear la venta
      const productSale = await this.prisma.productSale.create({
        data: { ...createProductSaleDto },
        include: { product: true, sale: true, complex: true },
      });

      // Actualizar el stock
      await this.prisma.product.update({
        where: { id: createProductSaleDto.productId },
        data: { stock: { decrement: createProductSaleDto.quantity } },
      });

      return productSale;
    });
  }

  async findAll(complexId?: string): Promise<ProductSale[]> {
    return this.prisma.productSale.findMany({
      where: complexId ? { complexId } : {},
      include: {
        product: true,
        sale: true,
        complex: true,
      },
    });
  }

  async findOne(id: string): Promise<ProductSale> {
    const productSale = await this.prisma.productSale.findUnique({
      where: { id },
      include: {
        product: true,
        sale: true,
        complex: true,
      },
    });
    if (!productSale) {
      throw new NotFoundException(`Product sale with ID ${id} not found`);
    }
    return productSale;
  }

  async findBySale(saleId: string): Promise<ProductSale[]> {
    return this.prisma.productSale.findMany({
      where: { saleId },
      include: {
        product: true,
        complex: true,
      },
    });
  }

  async update(
    id: string,
    updateProductSaleDto: UpdateProductSaleDto,
  ): Promise<ProductSale> {
    // Verificar que existe la venta
    const existingSale = await this.prisma.productSale.findUnique({
      where: { id },
    });
    if (!existingSale) {
      throw new NotFoundException(`Product sale with ID ${id} not found`);
    }

    // Preparar los datos de actualización
    const updateData: any = { ...updateProductSaleDto };

    // Manejar relaciones si se proporcionan
    if (updateProductSaleDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateProductSaleDto.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${updateProductSaleDto.productId} not found`,
        );
      }
      updateData.product = { connect: { id: product.id } };
    }

    if (updateProductSaleDto.complexId) {
      const complex = await this.prisma.complex.findUnique({
        where: { id: updateProductSaleDto.complexId },
      });
      if (!complex) {
        throw new NotFoundException(
          `Complex with ID ${updateProductSaleDto.complexId} not found`,
        );
      }
      updateData.complex = { connect: { id: complex.id } };
    }

    return this.prisma.productSale.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        sale: true,
        complex: true,
      },
    });
  }

  async remove(id: string): Promise<ProductSale> {
    // Verificar que existe antes de eliminar
    const productSale = await this.prisma.productSale.findUnique({
      where: { id },
    });
    if (!productSale) {
      throw new NotFoundException(`Product sale with ID ${id} not found`);
    }

    return this.prisma.productSale.delete({
      where: { id },
    });
  }
}
