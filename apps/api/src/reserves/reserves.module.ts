import { Module } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { ReservesController } from './reserves.controller';
import { AutomaticReservesController } from './controllers/automatic-reserves.controller';
import { AutomaticReservesService } from './services/automatic-reserves.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ScheduleHelper } from './helpers/schedule.helper';
import { ScheduleDayService } from 'src/schedule-days/schedule-days.service';
import { CourtsService } from 'src/courts/courts.service';
import { ComplexService } from 'src/complexs/complexs.service';
import { SportTypesService } from 'src/sport-types/sport-types.service';

@Module({
  controllers: [ReservesController, AutomaticReservesController],
  providers: [
    ReservesService,
    AutomaticReservesService,
    PrismaService,
    UsersService,
    ScheduleHelper,
    ScheduleDayService,
    CourtsService,
    ComplexService,
    SportTypesService,
  ],
  exports: [AutomaticReservesService],
})
export class ReservesModule {}
