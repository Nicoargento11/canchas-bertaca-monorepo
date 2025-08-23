import { Module } from '@nestjs/common';
import { RateService } from './rates.service';
import { RateController } from './rates.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RateController],
  providers: [RateService, PrismaService],
})
export class RatesModule {}
