import { Module } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { ReservesController } from './reserves.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/user/users.service';
import { ScheduleDayService } from 'src/schedule-days/schedule-days.service';
import { CourtsService } from 'src/courts/courts.service';
import { PaymentsService } from 'src/payments/payments.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ReservesController],
  providers: [
    ReservesService,
    PrismaService,
    UsersService,
    ScheduleDayService,
    CourtsService,
    PaymentsService,
    JwtService,
  ],
})
export class ReservesModule {}
