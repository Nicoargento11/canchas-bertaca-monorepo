import { Module } from '@nestjs/common';
import { InventoryMovementController } from './inventory-movements.controller';
import { InventoryMovementService } from './inventory-movements.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService, PrismaService],
})
export class InventoryMovementsModule {}
