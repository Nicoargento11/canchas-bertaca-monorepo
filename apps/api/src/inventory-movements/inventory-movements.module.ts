import { Module } from '@nestjs/common';
import { InventoryMovementsService } from './inventory-movements.service';
import { InventoryMovementsController } from './inventory-movements.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [InventoryMovementsController],
  providers: [InventoryMovementsService, PrismaService],
  exports: [InventoryMovementsService],
})
export class InventoryMovementsModule {}
