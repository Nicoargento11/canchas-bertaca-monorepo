import { Module } from '@nestjs/common';
import { UnavailableDayService } from './unavailable-days.service';
import { UnavailableDayController } from './unavailable-days.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UnavailableDayController],
  providers: [UnavailableDayService, PrismaService],
})
export class UnavailableDaysModule {}
