import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MonitoringRangeDto } from './dto/monitoring-range.dto';
import { MonitoringPaymentsQueryDto } from './dto/monitoring-payments-query.dto';

function parseRange(dto: { from?: string; to?: string }) {
  const now = new Date();
  const to = dto.to ? new Date(dto.to) : now;
  const from = dto.from
    ? new Date(dto.from)
    : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { from, to, now };
}

function maxDate(a?: Date | null, b?: Date | null) {
  if (!a) return b ?? null;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

@Injectable()
export class AdminMonitoringService {
  constructor(private prisma: PrismaService) {}

  getHealth() {
    return {
      now: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      node: process.version,
      env: process.env.NODE_ENV ?? null,
    };
  }

  async getOverview(rangeDto: MonitoringRangeDto) {
    const { from, to, now } = parseRange(rangeDto);

    const complexWhere = rangeDto.complexId
      ? { id: rangeDto.complexId }
      : undefined;
    const orgWhere = rangeDto.organizationId
      ? { id: rangeDto.organizationId }
      : undefined;

    const complexes = await this.prisma.complex.findMany({
      where: {
        ...(complexWhere ? { id: rangeDto.complexId } : {}),
        ...(orgWhere ? { organizationId: rangeDto.organizationId } : {}),
      },
      select: { id: true },
    });
    const complexIds = complexes.map((c) => c.id);

    const reserveWhereBase = complexIds.length
      ? { complexId: { in: complexIds } }
      : complexWhere || orgWhere
        ? { complexId: { in: [] as string[] } }
        : undefined;

    const [
      totalOrganizations,
      totalComplexes,
      totalUsers,
      reservesCreated,
      reservesCancelled,
      reservesPendingExpired,
      paymentsCreated,
      orphanPayments,
      inactivePaymentConfigs,
      activeCashSessions,
    ] = await Promise.all([
      rangeDto.organizationId
        ? this.prisma.organization.count({
            where: { id: rangeDto.organizationId },
          })
        : this.prisma.organization.count(),

      rangeDto.complexId
        ? this.prisma.complex.count({ where: { id: rangeDto.complexId } })
        : rangeDto.organizationId
          ? this.prisma.complex.count({
              where: { organizationId: rangeDto.organizationId },
            })
          : this.prisma.complex.count(),

      this.prisma.user.count({
        where:
          rangeDto.organizationId || rangeDto.complexId
            ? {
                ...(rangeDto.organizationId
                  ? { organizationId: rangeDto.organizationId }
                  : {}),
                ...(rangeDto.complexId
                  ? { complexId: rangeDto.complexId }
                  : {}),
              }
            : undefined,
      }),

      this.prisma.reserve.count({
        where: {
          createdAt: { gte: from, lt: to },
          ...(reserveWhereBase ? reserveWhereBase : {}),
        },
      }),

      this.prisma.reserve.count({
        where: {
          createdAt: { gte: from, lt: to },
          status: 'CANCELADO',
          ...(reserveWhereBase ? reserveWhereBase : {}),
        },
      }),

      this.prisma.reserve.count({
        where: {
          status: 'PENDIENTE',
          expiresAt: { not: null, lt: now },
          ...(reserveWhereBase ? reserveWhereBase : {}),
        },
      }),

      this.prisma.payment.count({
        where: {
          createdAt: { gte: from, lt: to },
          ...(complexIds.length ? { complexId: { in: complexIds } } : {}),
        },
      }),

      this.prisma.payment.count({
        where: {
          createdAt: { gte: from, lt: to },
          reserveId: null,
          saleId: null,
          tournamentRegistrationId: null,
          ...(complexIds.length ? { complexId: { in: complexIds } } : {}),
        },
      }),

      this.prisma.paymentConfig.count({
        where: {
          isActive: false,
          ...(complexIds.length ? { complexId: { in: complexIds } } : {}),
        },
      }),

      this.prisma.cashSession.count({
        where: {
          status: 'ACTIVE',
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
      }),
    ]);

    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      totals: {
        organizations: totalOrganizations,
        complexes: totalComplexes,
        users: totalUsers,
      },
      activity: {
        reservesCreated,
        reservesCancelled,
        paymentsCreated,
      },
      flags: {
        reservesPendingExpired,
        orphanPayments,
        inactivePaymentConfigs,
        activeCashSessions,
      },
    };
  }

  async getAnomalies(rangeDto: MonitoringRangeDto) {
    const { from, to, now } = parseRange(rangeDto);
    const staleHours = rangeDto.staleHours ?? 24;
    const staleBefore = new Date(now.getTime() - staleHours * 60 * 60 * 1000);

    const complexes = await this.prisma.complex.findMany({
      where: {
        ...(rangeDto.complexId ? { id: rangeDto.complexId } : {}),
        ...(rangeDto.organizationId
          ? { organizationId: rangeDto.organizationId }
          : {}),
      },
      select: { id: true },
    });
    const complexIds = complexes.map((c) => c.id);

    const reserveWhere = complexIds.length
      ? { complexId: { in: complexIds } }
      : {};
    const paymentWhere = complexIds.length
      ? { complexId: { in: complexIds } }
      : {};

    const [
      pendingExpiredCount,
      pendingExpiredSample,
      staleCashCount,
      staleCashSample,
      orphanPaymentsCount,
      orphanPaymentsSample,
    ] = await Promise.all([
      this.prisma.reserve.count({
        where: {
          status: 'PENDIENTE',
          expiresAt: { not: null, lt: now },
          ...reserveWhere,
        },
      }),
      this.prisma.reserve.findMany({
        where: {
          status: 'PENDIENTE',
          expiresAt: { not: null, lt: now },
          ...reserveWhere,
        },
        orderBy: { expiresAt: 'asc' },
        take: 20,
        select: {
          id: true,
          expiresAt: true,
          complexId: true,
          paymentIdExt: true,
          paymentToken: true,
        },
      }),

      this.prisma.cashSession.count({
        where: {
          status: 'ACTIVE',
          startAt: { lt: staleBefore },
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
      }),
      this.prisma.cashSession.findMany({
        where: {
          status: 'ACTIVE',
          startAt: { lt: staleBefore },
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
        orderBy: { startAt: 'asc' },
        take: 20,
        select: {
          id: true,
          startAt: true,
          status: true,
          cashRegister: {
            select: { id: true, complexId: true, name: true },
          },
          userId: true,
        },
      }),

      this.prisma.payment.count({
        where: {
          createdAt: { gte: from, lt: to },
          reserveId: null,
          saleId: null,
          tournamentRegistrationId: null,
          ...paymentWhere,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          createdAt: { gte: from, lt: to },
          reserveId: null,
          saleId: null,
          tournamentRegistrationId: null,
          ...paymentWhere,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          amount: true,
          method: true,
          transactionType: true,
          createdAt: true,
          complexId: true,
        },
      }),
    ]);

    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      rules: {
        pendingExpired: {
          severity: pendingExpiredCount > 0 ? 'warning' : 'ok',
          count: pendingExpiredCount,
          sample: pendingExpiredSample,
        },
        staleCashSessions: {
          severity: staleCashCount > 0 ? 'warning' : 'ok',
          count: staleCashCount,
          threshold: { staleHours },
          sample: staleCashSample,
        },
        orphanPayments: {
          severity: orphanPaymentsCount > 0 ? 'warning' : 'ok',
          count: orphanPaymentsCount,
          sample: orphanPaymentsSample,
        },
      },
    };
  }

  async getPayments(query: MonitoringPaymentsQueryDto) {
    const { from, to } = parseRange(query);
    const take = query.take ?? 50;
    const skip = query.skip ?? 0;

    const where = {
      createdAt: { gte: from, lt: to },
      ...(query.complexId ? { complexId: query.complexId } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          amount: true,
          method: true,
          transactionType: true,
          isPartial: true,
          createdAt: true,
          reserveId: true,
          saleId: true,
          tournamentRegistrationId: true,
          complexId: true,
          reserve: {
            select: {
              id: true,
              status: true,
              date: true,
              schedule: true,
              complexId: true,
            },
          },
          sale: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
              complexId: true,
            },
          },
          tournamentRegistration: {
            select: {
              id: true,
              tournamentId: true,
              createdAt: true,
            },
          },
          complex: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      pagination: { total, skip, take },
      items,
    };
  }

  async getIntegrity(rangeDto: MonitoringRangeDto) {
    const { from, to, now } = parseRange(rangeDto);

    const inactiveDays = rangeDto.inactiveDays ?? 14;
    const silentBefore = new Date(
      now.getTime() - inactiveDays * 24 * 60 * 60 * 1000,
    );

    const warningStaleHours = rangeDto.staleHours ?? 24;
    const criticalStaleHours = Math.max(72, warningStaleHours * 3);
    const warningStaleBefore = new Date(
      now.getTime() - warningStaleHours * 60 * 60 * 1000,
    );
    const criticalStaleBefore = new Date(
      now.getTime() - criticalStaleHours * 60 * 60 * 1000,
    );

    const complexes = await this.prisma.complex.findMany({
      where: {
        ...(rangeDto.complexId ? { id: rangeDto.complexId } : {}),
        ...(rangeDto.organizationId
          ? { organizationId: rangeDto.organizationId }
          : {}),
      },
      select: { id: true, isActive: true },
      take: 1000,
    });
    const complexIds = complexes.map((c) => c.id);

    const paymentWhereScoped = complexIds.length
      ? { complexId: { in: complexIds } }
      : {};
    const reserveWhereScoped = complexIds.length
      ? { complexId: { in: complexIds } }
      : {};

    const [
      paymentsMissingTenantCount,
      paymentsMissingTenantSample,
      orphanPaymentsCount,
      orphanPaymentsSample,
      reservesWithPaymentTokenNoPaymentsCount,
      reservesWithPaymentTokenNoPaymentsSample,
      activeComplexesMissingPaymentConfigCount,
      activeComplexesMissingPaymentConfigSample,
      pendingExpiredCount,
      staleCashSessionsWarningCount,
      staleCashSessionsWarningSample,
      staleCashSessionsCriticalCount,
      staleCashSessionsCriticalSample,
      lastReserveByComplex,
      lastPaymentByComplex,
    ] = await Promise.all([
      this.prisma.payment.count({
        where: {
          createdAt: { gte: from, lt: to },
          complexId: null,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          createdAt: { gte: from, lt: to },
          complexId: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          amount: true,
          method: true,
          transactionType: true,
          createdAt: true,
          reserveId: true,
          saleId: true,
          tournamentRegistrationId: true,
        },
      }),

      this.prisma.payment.count({
        where: {
          createdAt: { gte: from, lt: to },
          reserveId: null,
          saleId: null,
          tournamentRegistrationId: null,
          ...paymentWhereScoped,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          createdAt: { gte: from, lt: to },
          reserveId: null,
          saleId: null,
          tournamentRegistrationId: null,
          ...paymentWhereScoped,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          amount: true,
          method: true,
          transactionType: true,
          createdAt: true,
          complexId: true,
        },
      }),

      this.prisma.reserve.count({
        where: {
          createdAt: { gte: from, lt: to },
          paymentToken: { not: null },
          payment: { none: {} },
          ...reserveWhereScoped,
        },
      }),
      this.prisma.reserve.findMany({
        where: {
          createdAt: { gte: from, lt: to },
          paymentToken: { not: null },
          payment: { none: {} },
          ...reserveWhereScoped,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          status: true,
          createdAt: true,
          expiresAt: true,
          complexId: true,
          paymentIdExt: true,
          paymentToken: true,
        },
      }),

      this.prisma.complex.count({
        where: {
          isActive: true,
          paymentConfig: { is: null },
          ...(rangeDto.organizationId
            ? { organizationId: rangeDto.organizationId }
            : {}),
          ...(rangeDto.complexId ? { id: rangeDto.complexId } : {}),
        },
      }),
      this.prisma.complex.findMany({
        where: {
          isActive: true,
          paymentConfig: { is: null },
          ...(rangeDto.organizationId
            ? { organizationId: rangeDto.organizationId }
            : {}),
          ...(rangeDto.complexId ? { id: rangeDto.complexId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          slug: true,
          organizationId: true,
          isActive: true,
        },
      }),

      this.prisma.reserve.count({
        where: {
          status: 'PENDIENTE',
          expiresAt: { not: null, lt: now },
          ...reserveWhereScoped,
        },
      }),

      this.prisma.cashSession.count({
        where: {
          status: 'ACTIVE',
          startAt: { lt: warningStaleBefore },
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
      }),
      this.prisma.cashSession.findMany({
        where: {
          status: 'ACTIVE',
          startAt: { lt: warningStaleBefore },
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
        orderBy: { startAt: 'asc' },
        take: 20,
        select: {
          id: true,
          startAt: true,
          status: true,
          cashRegister: { select: { id: true, complexId: true, name: true } },
          userId: true,
        },
      }),

      this.prisma.cashSession.count({
        where: {
          status: 'ACTIVE',
          startAt: { lt: criticalStaleBefore },
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
      }),
      this.prisma.cashSession.findMany({
        where: {
          status: 'ACTIVE',
          startAt: { lt: criticalStaleBefore },
          ...(complexIds.length
            ? {
                cashRegister: {
                  complexId: { in: complexIds },
                },
              }
            : {}),
        },
        orderBy: { startAt: 'asc' },
        take: 20,
        select: {
          id: true,
          startAt: true,
          status: true,
          cashRegister: { select: { id: true, complexId: true, name: true } },
          userId: true,
        },
      }),

      this.prisma.reserve.groupBy({
        by: ['complexId'],
        where: complexIds.length
          ? { complexId: { in: complexIds } }
          : undefined,
        _max: { createdAt: true },
      }),
      this.prisma.payment.groupBy({
        by: ['complexId'],
        where: complexIds.length
          ? { complexId: { in: complexIds } }
          : undefined,
        _max: { createdAt: true },
      }),
    ]);

    const lastReserveMap = new Map<string, Date | null>();
    for (const row of lastReserveByComplex) {
      lastReserveMap.set(row.complexId, row._max.createdAt ?? null);
    }

    const lastPaymentMap = new Map<string, Date | null>();
    for (const row of lastPaymentByComplex) {
      lastPaymentMap.set(row.complexId, row._max.createdAt ?? null);
    }

    const silentComplexIds = complexes
      .filter((c) => c.isActive)
      .map((c) => {
        const lastReserveAt = lastReserveMap.get(c.id) ?? null;
        const lastPaymentAt = lastPaymentMap.get(c.id) ?? null;
        const lastActivityAt = maxDate(lastReserveAt, lastPaymentAt);
        return { complexId: c.id, lastActivityAt };
      })
      .filter((x) => !x.lastActivityAt || x.lastActivityAt < silentBefore)
      .sort((a, b) => {
        const at = a.lastActivityAt?.getTime() ?? 0;
        const bt = b.lastActivityAt?.getTime() ?? 0;
        return at - bt;
      });

    const silentComplexIdSet = new Set(
      silentComplexIds.map((x) => x.complexId),
    );
    const silentComplexesSample = silentComplexIdSet.size
      ? await this.prisma.complex.findMany({
          where: { id: { in: [...silentComplexIdSet].slice(0, 200) } },
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            organizationId: true,
            Organization: { select: { id: true, name: true, isActive: true } },
          },
          take: 20,
        })
      : [];

    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      rules: {
        pendingExpired: {
          severity: pendingExpiredCount > 0 ? 'warning' : 'ok',
          count: pendingExpiredCount,
        },
        paymentsMissingTenant: {
          severity: paymentsMissingTenantCount > 0 ? 'warning' : 'ok',
          count: paymentsMissingTenantCount,
          sample: paymentsMissingTenantSample,
        },
        orphanPayments: {
          severity: orphanPaymentsCount > 0 ? 'warning' : 'ok',
          count: orphanPaymentsCount,
          sample: orphanPaymentsSample,
        },
        reservesWithPaymentTokenNoPayments: {
          severity:
            reservesWithPaymentTokenNoPaymentsCount > 0 ? 'warning' : 'ok',
          count: reservesWithPaymentTokenNoPaymentsCount,
          sample: reservesWithPaymentTokenNoPaymentsSample,
        },
        activeComplexesMissingPaymentConfig: {
          severity:
            activeComplexesMissingPaymentConfigCount > 0 ? 'info' : 'ok',
          count: activeComplexesMissingPaymentConfigCount,
          sample: activeComplexesMissingPaymentConfigSample,
        },
        staleCashSessions: {
          severity:
            staleCashSessionsCriticalCount > 0
              ? 'critical'
              : staleCashSessionsWarningCount > 0
                ? 'warning'
                : 'ok',
          thresholds: {
            warningHours: warningStaleHours,
            criticalHours: criticalStaleHours,
          },
          warning: {
            count: staleCashSessionsWarningCount,
            sample: staleCashSessionsWarningSample,
          },
          critical: {
            count: staleCashSessionsCriticalCount,
            sample: staleCashSessionsCriticalSample,
          },
        },
        silentTenants: {
          severity: silentComplexIds.length > 0 ? 'info' : 'ok',
          thresholdDays: inactiveDays,
          count: silentComplexIds.length,
          sample: silentComplexesSample.map((c) => {
            const last =
              silentComplexIds.find((x) => x.complexId === c.id)
                ?.lastActivityAt ?? null;

            return {
              id: c.id,
              name: c.name,
              slug: c.slug,
              isActive: c.isActive,
              organization: c.Organization,
              lastActivityAt: last?.toISOString() ?? null,
            };
          }),
        },
      },
    };
  }

  async getTenantsStatus(rangeDto: MonitoringRangeDto) {
    const complexes = await this.prisma.complex.findMany({
      where: {
        ...(rangeDto.complexId ? { id: rangeDto.complexId } : {}),
        ...(rangeDto.organizationId
          ? { organizationId: rangeDto.organizationId }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        organizationId: true,
        Organization: { select: { id: true, name: true, isActive: true } },
        paymentConfig: { select: { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const complexIds = complexes.map((c) => c.id);

    const [reserveLast, paymentLast] = await Promise.all([
      this.prisma.reserve.groupBy({
        by: ['complexId'],
        where: { complexId: { in: complexIds } },
        _max: { createdAt: true },
      }),
      this.prisma.payment.groupBy({
        by: ['complexId'],
        where: { complexId: { in: complexIds } },
        _max: { createdAt: true },
      }),
    ]);

    const lastReserveByComplex = new Map<string, Date | null>();
    for (const row of reserveLast) {
      lastReserveByComplex.set(row.complexId, row._max.createdAt ?? null);
    }

    const lastPaymentByComplex = new Map<string, Date | null>();
    for (const row of paymentLast) {
      lastPaymentByComplex.set(row.complexId, row._max.createdAt ?? null);
    }

    const items = complexes.map((c) => {
      const lastReserveAt = lastReserveByComplex.get(c.id) ?? null;
      const lastPaymentAt = lastPaymentByComplex.get(c.id) ?? null;
      const lastActivityAt = maxDate(lastReserveAt, lastPaymentAt);

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        isActive: c.isActive,
        organization: c.Organization,
        paymentConfig: { isActive: c.paymentConfig?.isActive ?? null },
        lastReserveAt: lastReserveAt?.toISOString() ?? null,
        lastPaymentAt: lastPaymentAt?.toISOString() ?? null,
        lastActivityAt: lastActivityAt?.toISOString() ?? null,
      };
    });

    return { count: items.length, items };
  }
}
