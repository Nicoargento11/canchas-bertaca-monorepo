import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ReservesService } from 'src/reserves/reserves.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/user/users.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [PaymentsController],
  providers: [PaymentsService, ReservesService, UsersService, PrismaService],
})
export class PaymentsModule {
  constructor() {}
}
