import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductController } from './products.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService],
})
export class ProductsModule {}
