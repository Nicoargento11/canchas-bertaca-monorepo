import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RatesController],
  providers: [RatesService, PrismaService],
})
export class RatesModule {}
