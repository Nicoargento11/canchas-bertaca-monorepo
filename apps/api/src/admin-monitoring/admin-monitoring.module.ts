import { Module } from '@nestjs/common';
import { AdminMonitoringController } from './admin-monitoring.controller';
import { AdminMonitoringService } from './admin-monitoring.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AdminMonitoringController],
  providers: [AdminMonitoringService, PrismaService],
})
export class AdminMonitoringModule {}
