import { Module } from '@nestjs/common';
import { ProductSaleService } from './product-sales.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductSaleController } from './product-sales.controller';

@Module({
  controllers: [ProductSaleController],
  providers: [ProductSaleService, PrismaService],
})
export class ProductSalesModule {}
