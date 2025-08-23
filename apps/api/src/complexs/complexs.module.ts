import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ComplexService } from './complexs.service';
import { ComplexController } from './complexs.controller';

@Module({
  imports: [AuthModule],
  controllers: [ComplexController],
  providers: [ComplexService, PrismaService, RolesGuard],
  exports: [ComplexService],
})
export class ComplexModule {}
