import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminMonitoringService } from './admin-monitoring.service';
import { MonitoringRangeDto } from './dto/monitoring-range.dto';
import { MonitoringPaymentsQueryDto } from './dto/monitoring-payments-query.dto';

@ApiTags('Admin Monitoring')
@ApiBearerAuth()
@Controller('admin/monitoring')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminMonitoringController {
  constructor(private readonly monitoring: AdminMonitoringService) {}

  @Get('health')
  @Roles(Role.SUPER_ADMIN)
  getHealth() {
    return this.monitoring.getHealth();
  }

  @Get('overview')
  @Roles(Role.SUPER_ADMIN)
  getOverview(@Query() query: MonitoringRangeDto) {
    return this.monitoring.getOverview(query);
  }

  @Get('anomalies')
  @Roles(Role.SUPER_ADMIN)
  getAnomalies(@Query() query: MonitoringRangeDto) {
    return this.monitoring.getAnomalies(query);
  }

  @Get('payments')
  @Roles(Role.SUPER_ADMIN)
  getPayments(@Query() query: MonitoringPaymentsQueryDto) {
    return this.monitoring.getPayments(query);
  }

  @Get('integrity')
  @Roles(Role.SUPER_ADMIN)
  getIntegrity(@Query() query: MonitoringRangeDto) {
    return this.monitoring.getIntegrity(query);
  }

  @Get('tenants')
  @Roles(Role.SUPER_ADMIN)
  getTenants(@Query() query: MonitoringRangeDto) {
    return this.monitoring.getTenantsStatus(query);
  }
}
