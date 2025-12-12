import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('admin/stats')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminStatsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  async getStats() {
    const [totalOrganizations, totalComplexes, totalUsers, activeReservations] =
      await Promise.all([
        this.prisma.organization.count(),
        this.prisma.complex.count(),
        this.prisma.user.count(),
        this.prisma.reserve.count({
          where: {
            status: 'APROBADO',
          },
        }),
      ]);

    return {
      totalOrganizations,
      totalComplexes,
      totalUsers,
      activeReservations,
    };
  }

  @Get('activity')
  @Roles('SUPER_ADMIN')
  async getRecentActivity() {
    // Obtener las últimas organizaciones creadas
    const recentOrganizations = await this.prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        createdAt: true,
      },
    });

    // Obtener los últimos complejos creados
    const recentComplexes = await this.prisma.complex.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        createdAt: true,
        Organization: {
          select: {
            name: true,
          },
        },
      },
    });

    // Obtener los últimos usuarios registrados
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        createdAt: true,
      },
    });

    return {
      organizations: recentOrganizations,
      complexes: recentComplexes,
      users: recentUsers,
    };
  }
}
