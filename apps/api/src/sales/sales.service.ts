import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { items, payments, ...saleData } = createSaleDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Sale
      const sale = await tx.sale.create({
        data: {
          totalAmount: saleData.totalAmount,
          complexId: saleData.complexId,
          createdById: saleData.createdById,
        },
      });

      // 2. Create Payments
      for (const payment of payments) {
        await tx.payment.create({
          data: {
            amount: payment.amount,
            method: payment.method as PaymentMethod,
            transactionType: 'VENTA_PRODUCTO',
            complexId: saleData.complexId,
            cashSessionId: saleData.cashSessionId,
            saleId: sale.id,
            isPartial: false,
          },
        });
      }

      // 3. Create ProductSales and Update Stock
      for (const item of items) {
        // Create ProductSale
        await tx.productSale.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            isGift: item.isGift || false,
            saleId: sale.id,
            complexId: saleData.complexId,
          },
        });

        // Update Product Stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // Create Inventory Movement
        await tx.inventoryMovement.create({
          data: {
            type: item.isGift ? 'REGALO' : 'VENTA',
            quantity: item.quantity,
            productId: item.productId,
            complexId: saleData.complexId,
            reason: item.isGift
              ? `Regalo (Venta ${sale.id})`
              : `Venta ${sale.id}`,
          },
        });
      }

      return sale;
    });
  }

  async findOne(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        productSales: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });
  }
}
