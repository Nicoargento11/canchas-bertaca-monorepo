import { Module } from '@nestjs/common';
import { ProductSalesService } from './product-sales.service';
import { ProductSalesController } from './product-sales.controller';
import { ReservesModule } from '../reserves/reserves.module';
import { ProductsModule } from 'src/product/products.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ProductsModule, ReservesModule],
  controllers: [ProductSalesController],
  providers: [ProductSalesService, PrismaService],
  exports: [ProductSalesService],
})
export class ProductSalesModule {}
