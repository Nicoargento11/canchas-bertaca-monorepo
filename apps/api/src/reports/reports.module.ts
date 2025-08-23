import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExcelGeneratorService } from './generators/excel-generator.service';
import { PdfGeneratorService } from './generators/pdf-generator.service';
import { ScheduleHelper } from 'src/reserves/helpers/schedule.helper';
import { ScheduleDayService } from 'src/schedule-days/schedule-days.service';
import { CourtsService } from 'src/courts/courts.service';
import { SchedulesService } from 'src/schedules/schedules.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PrismaService,
    ExcelGeneratorService,
    PdfGeneratorService,
    ScheduleHelper,
    ScheduleDayService,
    CourtsService,
    SchedulesService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
