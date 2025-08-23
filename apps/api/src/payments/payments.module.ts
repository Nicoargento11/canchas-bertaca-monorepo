import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ReservesService } from 'src/reserves/reserves.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { UsersService } from 'src/users/users.service';
import { CourtsService } from 'src/courts/courts.service';
import { ComplexService } from 'src/complexs/complexs.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig.asProvider())],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    ReservesService,
    UsersService,
    PrismaService,
    MailService,
    CourtsService,
    ComplexService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {
  constructor() {}
}
