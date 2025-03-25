import { Module } from '@nestjs/common';
import { BenefitService } from './benefits.service';
import { BenefitController } from './benefits.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BenefitController],
  providers: [BenefitService, PrismaService],
})
export class BenefitsModule {}
