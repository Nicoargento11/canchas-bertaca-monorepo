import { Module } from '@nestjs/common';
import { EventPackagesService } from './event-packages.service';
import { EventPackagesController } from './event-packages.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EventPackagesController],
  providers: [EventPackagesService, PrismaService],
  exports: [EventPackagesService],
})
export class EventPackagesModule { }
