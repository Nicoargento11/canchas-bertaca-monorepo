import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { AdminStatsController } from './admin-stats.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [OrganizationsController, AdminStatsController],
  providers: [OrganizationsService, PrismaService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
