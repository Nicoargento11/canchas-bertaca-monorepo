import { Module } from '@nestjs/common';
import { SportTypesController } from './sport-types.controller';
import { SportTypesService } from './sport-types.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SportTypesController],
  providers: [SportTypesService, PrismaService],
  exports: [SportTypesService],
})
export class SportTypesModule {}
