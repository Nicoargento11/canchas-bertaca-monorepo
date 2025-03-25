import { Module } from '@nestjs/common';
import { ScheduleDayService } from './schedule-days.service';
import { ScheduleDayController } from './schedule-days.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ScheduleDayController],
  providers: [ScheduleDayService, PrismaService],
})
export class ScheduleDaysModule {}
