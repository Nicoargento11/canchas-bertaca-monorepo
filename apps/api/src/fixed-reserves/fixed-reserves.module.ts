import { Module } from '@nestjs/common';
import { FixedReservesService } from './fixed-reserves.service';
import { FixedReservesController } from './fixed-reserves.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FixedReservesController],
  providers: [FixedReservesService, PrismaService],
})
export class FixedReservesModule {}
