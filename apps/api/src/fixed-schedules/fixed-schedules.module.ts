// backend/src/fixed-schedules/fixed-schedules.module.ts
import { Module } from '@nestjs/common';
import { FixedSchedulesService } from './fixed-schedules.service';
import { FixedSchedulesController } from './fixed-schedules.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FixedSchedulesController],
  providers: [FixedSchedulesService, PrismaService],
})
export class FixedSchedulesModule {}
