import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, SportName } from '@prisma/client';
import { ExcelGeneratorService } from './generators/excel-generator.service';
import { PdfGeneratorService } from './generators/pdf-generator.service';
import {
  DailySummaryByCourt,
  DailyProductSales,
  DailySummaryResponse,
} from './interfaces/reports.interface';
import {
  DashboardData,
  DailyData,
  WeeklyData,
  MonthlyData,
  ProductData,
  PaymentMethodData,
  CanchaData,
  HorarioData,
} from './interfaces/dashboard.interface';
import { ScheduleHelper } from 'src/reserves/helpers/schedule.helper';
import { SchedulesService } from 'src/schedules/schedules.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private excelGenerator: ExcelGeneratorService,
    private pdfGenerator: PdfGeneratorService,
    private scheduleHelper: ScheduleHelper,
    private schedules: SchedulesService,
  ) { }

  /**
   * Obtiene el resumen diario completo de un complejo
   */ async getDailySummary(
    date: string,
    complexId: string,
    cashSessionId?: string,
  ): Promise<DailySummaryResponse> {
    // Crear fechas considerando la zona horaria de Argentina (UTC-3)
    // Cuando es 00:00 en Argentina, en UTC son las 03:00
    const startOfDay = new Date(date + 'T03:00:00.000Z'); // 00:00 Argentina = 03:00 UTC
    const endOfDay = new Date(date + 'T02:59:59.999Z'); // 23:59 Argentina = 02:59 UTC (día siguiente)
    endOfDay.setDate(endOfDay.getDate() + 1); // Mover al día siguiente en UTC

    // console.log('=== DEBUG FECHAS ARGENTINA (UTC-3) ===');
    // console.log('Fecha string recibida:', date);
    // console.log('startOfDay UTC (00:00 ARG):', startOfDay.toISOString());
    // console.log('endOfDay UTC (23:59 ARG):', endOfDay.toISOString());

    // Obtener información del complejo
    const complex = await this.prisma.complex.findUnique({
      where: { id: complexId },
      select: { id: true, name: true },
    });

    if (!complex) {
      throw new Error('Complejo no encontrado');
    }

    // Obtener resumen por canchas
    const courtsSummary = await this.getCourtsSummary(
      startOfDay,
      endOfDay,
      complexId,
    );
    // Obtener resumen de productos
    const productsSummary = await this.getProductsSummary(
      complexId,
      cashSessionId,
    );

    // Calcular totales
    const totals = this.calculateTotals(courtsSummary, productsSummary);

    return {
      date,
      complexId: complex.id,
      complexName: complex.name,
      courts: courtsSummary,
      products: productsSummary,
      totals,
    };
  }

  /**
   * Obtiene el resumen de reservas por cancha y tipo de deporte
   * LÓGICA: Reservas que se JUEGAN hoy + solo pagos REALIZADOS hoy
   */
  async getCourtsSummary(
    startOfDay: Date,
    endOfDay: Date,
    complexId: string,
  ): Promise<DailySummaryByCourt[]> {
    // Calcular la fecha exacta (sin hora) para buscar reservas
    const reserveDate = new Date(startOfDay);
    reserveDate.setUTCHours(0, 0, 0, 0);

    // Traer reservas que se juegan hoy O que fueron creadas hoy
    const reserves = await this.prisma.reserve.findMany({
      where: {
        complexId,
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
        OR: [
          { date: reserveDate },
          {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        ],
      },
      include: {
        court: {
          include: {
            sportType: true,
          },
        },
        payment: {
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
      orderBy: [{ court: { courtNumber: 'asc' } }, { schedule: 'asc' }],
    });

    // Agrupar por cancha
    const courtMap = new Map<string, DailySummaryByCourt>();

    for (const reserve of reserves) {
      const courtId = reserve.court.id;
      if (!courtMap.has(courtId)) {
        courtMap.set(courtId, {
          courtId,
          courtName:
            reserve.court.name || `Cancha ${reserve.court.courtNumber}`,
          courtNumber: reserve.court.courtNumber,
          sportType: reserve.court.sportType?.name || 'FUTBOL_5',
          sportTypeName: this.getSportTypeName(
            reserve.court.sportType?.name || 'FUTBOL_5',
          ),
          totalRevenue: 0,
          totalReservations: 0,
          totalReservationAmount: 0,
          totalPaid: 0,
          paymentsByMethod: [],
          reservations: [],
        });
      }
      const courtData = courtMap.get(courtId)!;
      // Sumar datos de la reserva
      courtData.totalReservations += 1;
      courtData.totalRevenue += reserve.price;
      courtData.totalReservationAmount += reserve.reservationAmount;
      // Los pagos ya vienen filtrados por createdAt en la query
      const paymentsToday = reserve.payment;
      const totalPaidToday = paymentsToday.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      courtData.totalPaid += totalPaidToday;
      // Agrupar pagos por método
      paymentsToday.forEach((payment) => {
        const existingMethod = courtData.paymentsByMethod.find(
          (p) => p.method === payment.method,
        );
        if (existingMethod) {
          existingMethod.amount += payment.amount;
          existingMethod.count += 1;
        } else {
          courtData.paymentsByMethod.push({
            method: payment.method,
            amount: payment.amount,
            count: 1,
          });
        }
      });
      // Agregar detalle de la reserva
      courtData.reservations.push({
        id: reserve.id,
        schedule: reserve.schedule,
        clientName: reserve.clientName,
        phone: reserve.phone,
        status: reserve.status,
        price: reserve.price,
        reservationAmount: reserve.reservationAmount,
        totalPaid: totalPaidToday, // Solo pagos realizados HOY
      });
    }
    return Array.from(courtMap.values());
  }

  /**
   * Obtiene el resumen de ventas de productos
   */
  async getProductsSummary(
    complexId: string,
    cashSessionId?: string,
  ): Promise<DailyProductSales[]> {
    let cashSession = null;
    if (cashSessionId) {
      cashSession = await this.prisma.cashSession.findUnique({
        where: { id: cashSessionId },
      });
    } else {
      // Buscar la caja del complejo
      const cashRegister = await this.prisma.cashRegister.findFirst({
        where: { complexId },
        orderBy: { createdAt: 'desc' },
      });
      if (!cashRegister) return [];
      // Buscar la cash session activa de esa caja
      cashSession = await this.prisma.cashSession.findFirst({
        where: {
          cashRegisterId: cashRegister.id,
          status: 'ACTIVE',
          endAt: null,
        },
        orderBy: { startAt: 'desc' },
      });
    }
    if (!cashSession) return [];
    const startAt = cashSession.startAt;
    const endAt = cashSession.endAt || new Date();

    // Buscar ProductSales del rango de la cash session
    const productSales = await this.prisma.productSale.findMany({
      where: {
        complexId,
        createdAt: {
          gte: startAt,
          lte: endAt,
        },
      },
      include: {
        product: true,
        sale: {
          include: {
            payments: true,
          },
        },
      },
      orderBy: [{ product: { name: 'asc' } }, { createdAt: 'asc' }],
    });

    // Agrupar por producto
    const productMap = new Map<string, DailyProductSales>();
    for (const productSale of productSales) {
      const { product, sale } = productSale;

      // Determine payment method
      let paymentMethod: PaymentMethod = PaymentMethod.EFECTIVO; // Default
      if (sale && sale.payments && sale.payments.length > 0) {
        const methods = new Set(sale.payments.map((p) => p.method));
        if (methods.size === 1) {
          paymentMethod = sale.payments[0].method;
        } else {
          paymentMethod = PaymentMethod.OTRO; // Mixed payments
        }
      }

      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          category: product.category,
          totalQuantity: 0,
          totalRevenue: 0,
          sales: [],
        });
      }

      const productData = productMap.get(product.id)!;
      productData.totalQuantity += productSale.quantity;

      // Calculate revenue (considering discount and gift)
      const revenue = productSale.isGift
        ? 0
        : productSale.price *
        productSale.quantity *
        (1 - (productSale.discount || 0) / 100);

      productData.totalRevenue += revenue;

      productData.sales.push({
        id: productSale.id,
        quantity: productSale.quantity,
        price: productSale.price,
        discount: productSale.discount,
        isGift: productSale.isGift,
        soldAt: productSale.createdAt,
        paymentMethod: paymentMethod,
      });
    }
    return Array.from(productMap.values());
  }
  /**
   * Calcula los totales generales
   */
  calculateTotals(
    courts: DailySummaryByCourt[],
    products: DailyProductSales[],
  ) {
    const totalRevenueReserves = courts.reduce(
      (sum, court) => sum + court.totalPaid,
      0,
    );

    const totalRevenueProducts = products.reduce(
      (sum, product) => sum + product.totalRevenue,
      0,
    );

    const totalReservations = courts.reduce(
      (sum, court) => sum + court.totalReservations,
      0,
    );

    const totalProductsSold = products.reduce(
      (sum, product) => sum + product.totalQuantity,
      0,
    );

    // Consolidar métodos de pago
    const paymentMethodMap = new Map<
      PaymentMethod,
      { amount: number; count: number }
    >();

    // Agregar pagos de reservas
    courts.forEach((court) => {
      court.paymentsByMethod.forEach((payment) => {
        const existing = paymentMethodMap.get(payment.method);
        if (existing) {
          existing.amount += payment.amount;
          existing.count += payment.count;
        } else {
          paymentMethodMap.set(payment.method, {
            amount: payment.amount,
            count: payment.count,
          });
        }
      });
    });

    // Agregar pagos de productos
    products.forEach((product) => {
      product.sales.forEach((sale) => {
        const saleAmount = sale.price * sale.quantity - (sale.discount || 0);
        const existing = paymentMethodMap.get(sale.paymentMethod);
        if (existing) {
          existing.amount += saleAmount;
          existing.count += 1;
        } else {
          paymentMethodMap.set(sale.paymentMethod, {
            amount: saleAmount,
            count: 1,
          });
        }
      });
    });

    const paymentMethodSummary = Array.from(paymentMethodMap.entries()).map(
      ([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
      }),
    );

    return {
      totalRevenueReserves,
      totalRevenueProducts,
      totalRevenue: totalRevenueReserves + totalRevenueProducts,
      totalReservations,
      totalProductsSold,
      paymentMethodSummary,
    };
  }

  /**
   * Convierte el enum SportName a nombre legible
   */
  private getSportTypeName(sportName: SportName): string {
    const names = {
      FUTBOL_5: 'Fútbol 5',
      FUTBOL_7: 'Fútbol 7',
      FUTBOL_11: 'Fútbol 11',
      PADEL: 'Pádel',
      TENIS: 'Tenis',
      BASKET: 'Básquet',
      VOLEY: 'Vóley',
      HOCKEY: 'Hockey',
    };
    return names[sportName] || sportName;
  }

  /**
   * Obtiene el resumen de un rango de fechas (para reportes semanales/mensuales)
   */ async getDateRangeSummary(
    startDate: string,
    endDate: string,
    complexId: string,
  ) {
    // Ajustar fechas para zona horaria de Argentina (UTC-3)
    const start = new Date(startDate + 'T03:00:00.000Z'); // 00:00 ARG = 03:00 UTC
    const end = new Date(endDate + 'T02:59:59.999Z'); // 23:59 ARG = 02:59 UTC (día siguiente)
    end.setDate(end.getDate() + 1); // Mover al día siguiente en UTC

    // Obtener resumen de reservas
    const reservesSummary = await this.prisma.reserve.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: start,
          lte: end,
        },
        complexId,
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
      _sum: {
        price: true,
        reservationAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Obtener resumen de productos
    const productsSummary = await this.prisma.productSale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        complexId,
      },
      _sum: {
        quantity: true,
        price: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      reserves: reservesSummary,
      products: productsSummary,
    };
  }
  /**
   * Genera un archivo Excel con el resumen diario
   */
  async generateDailySummaryExcel(
    date: string,
    complexId: string,
    cashSessionId?: string,
  ): Promise<Buffer> {
    const startOfDay = new Date(date + 'T03:00:00.000Z');
    const endOfDay = new Date(date + 'T02:59:59.999Z');
    endOfDay.setDate(endOfDay.getDate() + 1);
    const courtsSummary = await this.getCourtsSummary(
      startOfDay,
      endOfDay,
      complexId,
    );
    const productsSummary = await this.getProductsSummary(
      complexId,
      cashSessionId,
    );
    const totals = this.calculateTotals(courtsSummary, productsSummary);
    const summary = {
      date,
      complexId,
      complexName: '', // Puedes completar si lo necesitas
      courts: courtsSummary,
      products: productsSummary,
      totals,
    };
    return this.excelGenerator.generateDailySummaryExcel(summary, date);
  }

  /**
   * Genera un archivo PDF con el resumen diario
   */
  async generateDailySummaryPDF(
    date: string,
    complexId: string,
    cashSessionId?: string,
  ): Promise<Buffer> {
    const startOfDay = new Date(date + 'T03:00:00.000Z');
    const endOfDay = new Date(date + 'T02:59:59.999Z');
    endOfDay.setDate(endOfDay.getDate() + 1);
    const courtsSummary = await this.getCourtsSummary(
      startOfDay,
      endOfDay,
      complexId,
    );
    const productsSummary = await this.getProductsSummary(
      complexId,
      cashSessionId,
    );
    const totals = this.calculateTotals(courtsSummary, productsSummary);
    const summary = {
      date,
      complexId,
      complexName: '', // Puedes completar si lo necesitas
      courts: courtsSummary,
      products: productsSummary,
      totals,
    };

    return this.pdfGenerator.generateDailySummaryPDF(summary, date);
  }

  // ===================================
  // MÉTODOS DEL DASHBOARD
  // ===================================

  /**
   * Obtiene todos los datos del dashboard
   */
  async getDashboardData(
    complexId: string,
    startDate?: string,
    endDate?: string,
    cashSessionId?: string,
  ): Promise<DashboardData> {
    // Calcular fechas por defecto (último mes)
    const endDateStr = endDate || new Date().toISOString().split('T')[0];
    const startDateStr =
      startDate ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    // Calcular fechas actuales (ajustadas a horario operativo / UTC)
    const currentStart = new Date(startDateStr + 'T03:00:00.000Z');

    // El endDate necesita +1 día para incluir el día completo
    const currentEnd = new Date(endDateStr + 'T02:59:59.999Z');
    currentEnd.setDate(currentEnd.getDate() + 1);

    // Calcular fechas del período anterior
    const durationTime = currentEnd.getTime() - currentStart.getTime();
    const prevEnd = new Date(currentStart.getTime()); // Termina donde empieza el actual
    const prevStart = new Date(prevEnd.getTime() - durationTime);

    const [
      dailyData,
      weeklyData,
      monthlyData,
      products,
      paymentMethods,
      canchas,
      horarios,
      egresos,
      promotionsUsed,
      reservasByType,
      // Datos de comparación
      previousIngresos,
      previousReservas,
      previousEgresos,
      // Nuevos datos
      recentTransactions,
      // KPIs de negocio
      averageTicket,
      revenuePerHour,
      totalCourtHours,
      cancellationRate,
      // KPIs del período anterior
      previousAverageTicket,
      previousRevenuePerHour,
      previousCancellationRate,
    ] = await Promise.all([
      this.getDailyData(complexId, startDateStr, endDateStr),
      this.getWeeklyData(complexId, startDateStr, endDateStr),
      this.getMonthlyData(complexId, startDateStr, endDateStr),
      this.getProductsData(complexId, startDateStr, endDateStr, cashSessionId),
      this.getPaymentMethodsData(
        complexId,
        startDateStr,
        endDateStr,
        cashSessionId,
      ),
      this.getCanchasData(complexId, startDateStr, endDateStr),
      this.getHorariosData(complexId, startDateStr, endDateStr),
      this.getEgresosTotal(complexId, currentStart, currentEnd),
      this.getPromotionsUsedCount(complexId, currentStart, currentEnd),
      this.getReservasByType(complexId, currentStart, currentEnd),
      // Calls para comparación
      this.getIngresosTotalInRange(
        complexId,
        prevStart,
        prevEnd,
        cashSessionId,
      ),
      this.getReservasTotalInRange(complexId, prevStart, prevEnd),
      this.getEgresosTotal(complexId, prevStart, prevEnd),
      // Call para transacciones
      this.getRecentTransactions(complexId),
      // Calls para KPIs de negocio
      this.getAverageTicket(complexId, currentStart, currentEnd),
      this.getRevenuePerHour(complexId, currentStart, currentEnd),
      this.getTotalCourtHours(complexId, currentStart, currentEnd),
      this.getCancellationRate(complexId, currentStart, currentEnd),
      // KPIs del período anterior para comparación
      this.getAverageTicket(complexId, prevStart, prevEnd),
      this.getRevenuePerHour(complexId, prevStart, prevEnd),
      this.getCancellationRate(complexId, prevStart, prevEnd),
    ]);

    // Calcular ingresos totales del período actual
    const totalIngresos = dailyData.reduce((sum, d) => sum + d.ingresos, 0);

    // Calcular margen neto
    const netMargin = totalIngresos - egresos;
    const netMarginPercentage =
      totalIngresos > 0 ? Math.round((netMargin / totalIngresos) * 100) : 0;

    // Calcular margen neto del período anterior
    const prevNetMargin = previousIngresos - previousEgresos;
    const prevNetMarginPercentage =
      previousIngresos > 0
        ? Math.round((prevNetMargin / previousIngresos) * 100)
        : 0;

    // Obtener datos de inventario y clientes en paralelo
    const [
      lowStockProducts,
      highMarginProducts,
      deadStockProducts,
      topCustomers,
      customerSegmentation,
      inactiveCustomers,
      problematicCustomers,
    ] = await Promise.all([
      this.getLowStockProducts(complexId),
      this.getHighMarginProducts(complexId),
      this.getDeadStockProducts(complexId, startDateStr, endDateStr),
      this.getTopCustomers(complexId, startDateStr, endDateStr),
      this.getCustomerSegmentation(complexId, startDateStr, endDateStr),
      this.getInactiveCustomers(complexId),
      this.getProblematicCustomers(complexId, startDateStr, endDateStr),
    ]);

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      products,
      paymentMethods,
      canchas,
      horarios,
      totalEgresos: egresos,
      promotionsUsed,
      reservasFijas: reservasByType.fijas,
      reservasNormales: reservasByType.normales,
      // Comparación básica
      previousIngresos,
      previousReservas,
      previousEgresos,
      // Transacciones
      recentTransactions,
      // KPIs de Negocio
      averageTicket,
      revenuePerHour,
      totalCourtHours,
      cancellationRate,
      netMargin,
      netMarginPercentage,
      // Comparación KPIs período anterior
      previousAverageTicket,
      previousRevenuePerHour,
      previousCancellationRate,
      previousNetMargin: prevNetMargin,
      previousNetMarginPercentage: prevNetMarginPercentage,
      // Inventario y análisis de productos
      lowStockProducts,
      highMarginProducts,
      deadStockProducts,
      // Análisis de clientes
      topCustomers,
      customerSegmentation,
      inactiveCustomers,
      problematicCustomers,
    };
  }

  /**
   * Obtiene datos diarios (rango dinámico)
   */
  private async getDailyData(
    complexId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyData[]> {
    const dailyData: DailyData[] = [];
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Parsear fechas de inicio y fin (asegurando mediodía para evitar saltos de día por zona horaria)
    const start = new Date(startDate + 'T12:00:00Z');
    const end = new Date(endDate + 'T12:00:00Z');

    // Iterar día por día
    const current = new Date(start);
    while (current <= end) {
      const targetDate = new Date(current);

      // Rango ajustado a Argentina (03:00 UTC a 03:00 UTC+1)
      // Ideal para: Pagos, Creación de usuarios, Cancelaciones (eventos con hora exacta)
      const { start: startAr, end: endAr } = this.getDayRangeUTC3(targetDate);

      // Rango UTC puro (00:00 UTC a 00:00 UTC+1)
      // Ideal para: Reservas (donde 'date' suele guardarse como 00:00 UTC)
      const startUtc = new Date(
        Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          0,
          0,
          0,
        ),
      );
      const endUtc = new Date(startUtc);
      endUtc.setDate(endUtc.getDate() + 1);

      // Calcular día de la semana basado en la fecha ajustada a AR
      const dayIndex = targetDate.getUTCDay();
      const dayOfWeek = days[dayIndex === 0 ? 6 : dayIndex - 1];

      // Obtener datos del día actual
      const [reservasHoy, ingresos, cancelaciones, clientesNuevos] =
        await Promise.all([
          this.getReservasPorDia(complexId, startUtc, endUtc), // Usar rango UTC puro para reservas
          this.getIngresosPorDia(complexId, startAr), // Usar rango AR para dinero
          this.getCancelacionesPorDia(complexId, startAr, endAr),
          this.getClientesNuevosPorDia(complexId, startAr, endAr),
        ]);

      // Obtener datos del día anterior
      const targetDateBefore = new Date(targetDate);
      targetDateBefore.setDate(targetDateBefore.getDate() - 1);

      // Rango UTC puro para reservas del día anterior
      const startUtcBefore = new Date(startUtc);
      startUtcBefore.setDate(startUtcBefore.getDate() - 1);
      const endUtcBefore = new Date(startUtc); // Termina donde empieza el de hoy

      const diaAnterior = await this.getReservasPorDia(
        complexId,
        startUtcBefore,
        endUtcBefore,
      );

      // Calcular ocupación
      // Usamos 'startUtc' que es el inicio del día (00:00 UTC).
      const scheduleInfo = await this.scheduleHelper.getScheduleInfo(
        startUtc,
        complexId,
      );
      const totalSlots = scheduleInfo?.schedules
        ? scheduleInfo.schedules.reduce((sum, schedule) => {
          return (
            sum + this.calculateSlots(schedule.startTime, schedule.endTime)
          );
        }, 0)
        : 0;

      const ocupacion =
        totalSlots > 0
          ? Math.min(Math.round((reservasHoy / totalSlots) * 100), 100)
          : 0; // Evitar división por cero o sin schedules

      dailyData.push({
        day: dayOfWeek,
        reservas: reservasHoy,
        ingresos,
        diaAnterior,
        cancelaciones,
        ocupacion,
        clientesNuevos,
      });

      // Avanzar al siguiente día
      current.setDate(current.getDate() + 1);
    }

    return dailyData;
  }

  /**
   * Obtiene datos semanales (rango dinámico)
   */
  private async getWeeklyData(
    complexId: string,
    startDate: string,
    endDate: string,
  ): Promise<WeeklyData[]> {
    const weeklyData: WeeklyData[] = [];
    const allSchedules = await this.schedules.findByComplex(complexId);

    // Parsear fechas
    const start = new Date(startDate + 'T12:00:00Z');
    const end = new Date(endDate + 'T12:00:00Z');

    // Encontrar el lunes de la semana de inicio
    const current = new Date(start);
    const day = current.getUTCDay();
    const diff = current.getUTCDate() - day + (day === 0 ? -6 : 1);
    current.setUTCDate(diff);

    let weekCounter = 1;

    while (current <= end) {
      // Calcular fin de semana (Domingo)
      const weekEndTarget = new Date(current);
      weekEndTarget.setUTCDate(current.getUTCDate() + 6);

      // Obtener rangos UTC-3
      const { start: weekStart } = this.getDayRangeUTC3(current);
      const { end: weekEnd } = this.getDayRangeUTC3(weekEndTarget);

      // Datos de la semana actual
      const [reservas, ingresos, clientesNuevos] = await Promise.all([
        this.getReservasPorDia(complexId, weekStart, weekEnd),
        this.getIngresosPorDia(complexId, weekStart),
        this.getClientesNuevosPorDia(complexId, weekStart, weekEnd),
      ]);

      // Datos de la semana anterior
      const prevWeekStartTarget = new Date(current);
      prevWeekStartTarget.setUTCDate(current.getUTCDate() - 7);
      const { start: prevWeekStart } =
        this.getDayRangeUTC3(prevWeekStartTarget);

      const prevWeekEndTarget = new Date(weekEndTarget);
      prevWeekEndTarget.setUTCDate(weekEndTarget.getUTCDate() - 7);
      const { end: prevWeekEnd } = this.getDayRangeUTC3(prevWeekEndTarget);

      const semanaAnterior = await this.getReservasPorDia(
        complexId,
        prevWeekStart,
        prevWeekEnd,
      );

      const totalSlots = allSchedules.reduce((sum, schedule) => {
        return sum + this.calculateSlots(schedule.startTime, schedule.endTime);
      }, 0);

      // Multiplicar slots por 7 días
      const totalSlotsWeek = totalSlots * 7;

      const ocupacion =
        totalSlotsWeek > 0
          ? Math.min(Math.round((reservas / totalSlotsWeek) * 100), 100)
          : 0; // Evitar división por cero

      weeklyData.push({
        week: `Sem ${weekCounter}`,
        reservas,
        ingresos,
        semanaAnterior,
        ocupacion,
        clientesNuevos,
      });

      // Siguiente semana
      current.setUTCDate(current.getUTCDate() + 7);
      weekCounter++;
    }

    return weeklyData;
  }

  /**
   * Obtiene datos mensuales (rango dinámico)
   */
  private async getMonthlyData(
    complexId: string,
    startDate: string,
    endDate: string,
  ): Promise<MonthlyData[]> {
    const monthlyData: MonthlyData[] = [];
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    // Parsear fechas
    const start = new Date(startDate + 'T12:00:00Z');
    const end = new Date(endDate + 'T12:00:00Z');

    // Iniciar en el primer día del mes de inicio
    const current = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
    );

    // Obtener todos los horarios del complejo (una sola consulta)
    const allSchedules = await this.schedules.findByComplex(complexId);
    const slotsPorDia = allSchedules.reduce((sum, schedule) => {
      return sum + this.calculateSlots(schedule.startTime, schedule.endTime);
    }, 0);

    while (current <= end) {
      // Calcular fin de mes
      const monthEndTarget = new Date(
        Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0),
      );

      // Obtener rangos UTC-3
      const { start: monthStart } = this.getDayRangeUTC3(current);
      const { end: monthEnd } = this.getDayRangeUTC3(monthEndTarget);

      // Calcular días en el mes
      const daysInMonth = monthEndTarget.getUTCDate();

      // Obtener datos del mes
      const [reservas, ingresos, clientesNuevos] = await Promise.all([
        this.getReservasPorDia(complexId, monthStart, monthEnd),
        this.getIngresosPorDia(complexId, monthStart),
        this.getClientesNuevosPorDia(complexId, monthStart, monthEnd),
      ]);

      // Datos del mes anterior
      const prevMonthStartTarget = new Date(
        Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1),
      );
      const { start: prevMonthStart } =
        this.getDayRangeUTC3(prevMonthStartTarget);

      const prevMonthEndTarget = new Date(
        Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 0),
      );
      const { end: prevMonthEnd } = this.getDayRangeUTC3(prevMonthEndTarget);

      const mesAnterior = await this.getReservasPorDia(
        complexId,
        prevMonthStart,
        prevMonthEnd,
      );

      // Calcular slots totales del mes (slots por día * días del mes)
      const totalSlotsMonth = slotsPorDia * daysInMonth;

      // Calcular ocupación
      const ocupacion =
        totalSlotsMonth > 0
          ? Math.min(Math.round((reservas / totalSlotsMonth) * 100), 100)
          : 0;

      monthlyData.push({
        month: months[current.getUTCMonth()],
        reservas,
        ingresos,
        mesAnterior,
        ocupacion,
        clientesNuevos,
      });

      // Siguiente mes
      current.setUTCMonth(current.getUTCMonth() + 1);
    }

    return monthlyData;
  }

  private calculateSlots(startTime: string, endTime: string) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Convertir todo a minutos desde medianoche
    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    // Si endTime es anterior a startTime, asumimos que cruza medianoche (día siguiente)
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Sumar 24 horas en minutos
    }

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return Math.floor(durationMinutes / 60); // Slots de 1 hora
  }

  /**
   * Obtiene datos de productos
   */
  private async getProductsData(
    complexId: string,
    startDate: string,
    endDate: string,
    cashSessionId?: string,
  ): Promise<ProductData[]> {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    const whereCondition: any = {
      complexId,
      createdAt: {
        gte: startOfPeriod,
        lte: endOfPeriod,
      },
    };

    // Si hay cashSessionId, filtrar por sesión de caja
    if (cashSessionId) {
      const cashSession = await this.prisma.cashSession.findUnique({
        where: { id: cashSessionId },
      });
      if (cashSession) {
        whereCondition.createdAt = {
          gte: cashSession.startAt,
          lte: cashSession.endAt || new Date(),
        };
      }
    }

    const productSales = await this.prisma.productSale.groupBy({
      by: ['productId'],
      where: whereCondition,
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 6, // Top 6 productos
    });

    // Obtener información de productos
    const productIds = productSales.map((sale) => sale.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    return productSales.map((sale) => {
      const product = products.find((p) => p.id === sale.productId);
      return {
        name: product?.name || 'Producto desconocido',
        sales: sale._sum.quantity || 0,
        category: product?.category || 'Sin categoría',
      };
    });
  }

  /**
   * Obtiene productos con stock bajo (stock <= minStock)
   */
  private async getLowStockProducts(complexId: string) {
    // Prisma no soporta comparación de campos en where, usamos queryRaw
    const lowStockProducts = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        stock: number;
        minStock: number;
        category: string;
      }>
    >`
      SELECT id, name, stock, "minStock", category
      FROM "Product"
      WHERE "complexId" = ${complexId}
        AND "isActive" = true
        AND stock <= "minStock"
      ORDER BY stock ASC
      LIMIT 10
    `;

    return lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      minStock: product.minStock,
      category: product.category,
      status: product.stock === 0 ? 'SIN_STOCK' : 'BAJO',
    }));
  }

  /**
   * Obtiene productos con mejor margen de ganancia
   */
  private async getHighMarginProducts(complexId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        complexId,
        isActive: true,
        costPrice: {
          gt: 0, // Excluir productos sin costo definido
        },
      },
      select: {
        id: true,
        name: true,
        costPrice: true,
        salePrice: true,
        category: true,
        stock: true,
      },
    });

    // Calcular margen para cada producto
    const productsWithMargin = products.map((product) => {
      const margin = product.salePrice - product.costPrice;
      const marginPercentage = (margin / product.costPrice) * 100;

      return {
        id: product.id,
        name: product.name,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        margin,
        marginPercentage: Math.round(marginPercentage),
        category: product.category,
        stock: product.stock,
      };
    });

    // Ordenar por margen porcentual y tomar top 5
    return productsWithMargin
      .sort((a, b) => b.marginPercentage - a.marginPercentage)
      .slice(0, 5);
  }

  /**
   * Obtiene productos sin ventas en el período (dead stock)
   */
  private async getDeadStockProducts(
    complexId: string,
    startDate: string,
    endDate: string,
  ) {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    // Obtener todos los productos activos
    const allProducts = await this.prisma.product.findMany({
      where: {
        complexId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        category: true,
        costPrice: true,
        salePrice: true,
      },
    });

    // Obtener productos que SÍ tuvieron ventas
    const productsWithSales = await this.prisma.productSale.groupBy({
      by: ['productId'],
      where: {
        complexId,
        createdAt: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
      },
    });

    const soldProductIds = new Set(
      productsWithSales.map((sale) => sale.productId),
    );

    // Filtrar productos sin ventas que tengan stock
    const deadStock = allProducts
      .filter(
        (product) => !soldProductIds.has(product.id) && product.stock > 0,
      )
      .map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        category: product.category,
        tiedUpCapital: product.stock * product.costPrice, // Capital inmovilizado
      }))
      .sort((a, b) => b.tiedUpCapital - a.tiedUpCapital) // Los que más capital tienen inmovilizado
      .slice(0, 10);

    return deadStock;
  }

  /**
   * Obtiene top clientes por gasto total
   */
  private async getTopCustomers(
    complexId: string,
    startDate: string,
    endDate: string,
  ) {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    // Obtener pagos agrupados por usuario (solo de reservas completadas)
    const customerPayments = await this.prisma.payment.groupBy({
      by: ['reserveId'],
      where: {
        complexId,
        transactionType: 'RESERVA',
        createdAt: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
        reserve: {
          status: { in: ['APROBADO', 'COMPLETADO'] },
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Obtener información de las reservas y usuarios
    const reserveIds = customerPayments
      .map((p) => p.reserveId)
      .filter((id): id is string => id !== null);

    const reserves = await this.prisma.reserve.findMany({
      where: {
        id: { in: reserveIds },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Agrupar por usuario
    const customerMap = new Map<
      string,
      { name: string; phone: string | null; totalSpent: number; reservations: number }
    >();

    reserves.forEach((reserve) => {
      const payment = customerPayments.find((p) => p.reserveId === reserve.id);
      const amount = payment?._sum.amount || 0;

      const existing = customerMap.get(reserve.userId);
      if (existing) {
        existing.totalSpent += amount;
        existing.reservations += 1;
      } else {
        customerMap.set(reserve.userId, {
          name: reserve.user.name,
          phone: reserve.user.phone,
          totalSpent: amount,
          reservations: 1,
        });
      }
    });

    // Convertir a array y ordenar
    return Array.from(customerMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        phone: data.phone,
        totalSpent: Math.round(data.totalSpent),
        reservations: data.reservations,
        averageTicket: Math.round(data.totalSpent / data.reservations),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  /**
   * Segmentación de clientes: nuevos vs recurrentes
   */
  private async getCustomerSegmentation(
    complexId: string,
    startDate: string,
    endDate: string,
  ) {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    // Obtener todas las reservas del período
    const reservesInPeriod = await this.prisma.reserve.findMany({
      where: {
        complexId,
        date: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
        status: { in: ['APROBADO', 'COMPLETADO'] },
      },
      select: {
        userId: true,
        createdAt: true,
      },
    });

    const uniqueUsers = [...new Set(reservesInPeriod.map((r) => r.userId))];

    // Para cada usuario, verificar si es nuevo o recurrente
    const segmentation = await Promise.all(
      uniqueUsers.map(async (userId) => {
        // Buscar reservas ANTERIORES al período
        const previousReserves = await this.prisma.reserve.count({
          where: {
            userId,
            complexId,
            date: {
              lt: startOfPeriod,
            },
            status: { in: ['APROBADO', 'COMPLETADO'] },
          },
        });

        return {
          userId,
          isNew: previousReserves === 0,
        };
      }),
    );

    const newCustomers = segmentation.filter((s) => s.isNew).length;
    const returningCustomers = segmentation.filter((s) => !s.isNew).length;

    return {
      newCustomers,
      returningCustomers,
      totalCustomers: uniqueUsers.length,
      newCustomerPercentage:
        uniqueUsers.length > 0
          ? Math.round((newCustomers / uniqueUsers.length) * 100)
          : 0,
    };
  }

  /**
   * Obtiene clientes inactivos (sin reservas en los últimos 30 días)
   */
  private async getInactiveCustomers(complexId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Obtener usuarios que tuvieron reservas alguna vez
    const allCustomers = await this.prisma.reserve.findMany({
      where: {
        complexId,
        status: { in: ['APROBADO', 'COMPLETADO'] },
      },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Agrupar por usuario y obtener última reserva
    const customerLastReserve = new Map<
      string,
      { name: string; phone: string | null; lastReserveDate: Date }
    >();

    allCustomers.forEach((reserve) => {
      const existing = customerLastReserve.get(reserve.userId);
      if (!existing || reserve.date > existing.lastReserveDate) {
        customerLastReserve.set(reserve.userId, {
          name: reserve.user.name,
          phone: reserve.user.phone,
          lastReserveDate: reserve.date,
        });
      }
    });

    // Filtrar inactivos
    const inactiveCustomers = Array.from(customerLastReserve.entries())
      .filter(([_, data]) => data.lastReserveDate < thirtyDaysAgo)
      .map(([userId, data]) => {
        const daysSinceLastReserve = Math.floor(
          (Date.now() - data.lastReserveDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          userId,
          name: data.name,
          phone: data.phone,
          lastReserveDate: data.lastReserveDate,
          daysSinceLastReserve,
        };
      })
      .sort((a, b) => b.daysSinceLastReserve - a.daysSinceLastReserve)
      .slice(0, 20);

    return inactiveCustomers;
  }

  /**
   * Obtiene clientes con alta tasa de cancelación/rechazo
   */
  private async getProblematicCustomers(
    complexId: string,
    startDate: string,
    endDate: string,
  ) {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    // Obtener todas las reservas del período (incluyendo canceladas y rechazadas)
    const allReserves = await this.prisma.reserve.findMany({
      where: {
        complexId,
        date: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
      },
      select: {
        userId: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Agrupar por usuario y contar por status
    const customerStats = new Map<
      string,
      {
        name: string;
        phone: string | null;
        total: number;
        canceled: number;
        rejected: number;
        approved: number;
      }
    >();

    allReserves.forEach((reserve) => {
      const existing = customerStats.get(reserve.userId);

      const stats = existing || {
        name: reserve.user.name,
        phone: reserve.user.phone,
        total: 0,
        canceled: 0,
        rejected: 0,
        approved: 0,
      };

      stats.total += 1;
      if (reserve.status === 'CANCELADO') stats.canceled += 1;
      if (reserve.status === 'RECHAZADO') stats.rejected += 1;
      if (reserve.status === 'APROBADO' || reserve.status === 'COMPLETADO') {
        stats.approved += 1;
      }

      customerStats.set(reserve.userId, stats);
    });

    // Filtrar clientes con cancelaciones o rechazos
    const problematicCustomers = Array.from(customerStats.entries())
      .filter(([_, stats]) => stats.canceled > 0 || stats.rejected > 0)
      .map(([userId, stats]) => {
        const cancellationRate =
          stats.total > 0 ? Math.round((stats.canceled / stats.total) * 100) : 0;
        const rejectionRate =
          stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;

        return {
          userId,
          name: stats.name,
          phone: stats.phone,
          totalReservations: stats.total,
          canceledReservations: stats.canceled,
          rejectedReservations: stats.rejected,
          approvedReservations: stats.approved,
          cancellationRate,
          rejectionRate,
          problemScore: stats.canceled * 2 + stats.rejected * 3, // Rechazos pesan más
        };
      })
      .filter((customer) => customer.totalReservations >= 2) // Al menos 2 reservas
      .sort((a, b) => b.problemScore - a.problemScore)
      .slice(0, 20);

    return problematicCustomers;
  }

  /**
   * Obtiene datos de métodos de pago
   */
  private async getPaymentMethodsData(
    complexId: string,
    startDate: string,
    endDate: string,
    cashSessionId?: string,
  ): Promise<PaymentMethodData[]> {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    // Obtener pagos (tanto de reservas como de productos) filtrados por complexId
    const reservePayments = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        complexId,
        cashSessionId: cashSessionId || undefined,
        createdAt: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalAmount = reservePayments.reduce(
      (sum, payment) => sum + (payment._sum.amount || 0),
      0,
    );

    const methodNames = {
      EFECTIVO: 'Efectivo',
      TARJETA_CREDITO: 'Tarjeta',
      TRANSFERENCIA: 'Transferencia',
      MERCADOPAGO: 'MercadoPago',
      OTRO: 'Otro',
    };

    return reservePayments.map((payment) => ({
      name: methodNames[payment.method] || payment.method,
      value:
        totalAmount > 0
          ? Math.round(((payment._sum.amount || 0) / totalAmount) * 100)
          : 0,
    }));
  }

  /**
   * Obtiene datos de canchas
   */
  private async getCanchasData(
    complexId: string,
    startDate: string,
    endDate: string,
  ): Promise<CanchaData[]> {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    const courtsData = await this.prisma.reserve.groupBy({
      by: ['courtId'],
      where: {
        complexId,
        createdAt: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Obtener información de las canchas
    const courtIds = courtsData.map((data) => data.courtId);
    const courts = await this.prisma.court.findMany({
      where: {
        id: { in: courtIds },
      },
    });

    return courtsData.map((courtData) => {
      const court = courts.find((c) => c.id === courtData.courtId);
      return {
        name: court?.name || `Cancha ${court?.courtNumber || '?'}`,
        reservas: courtData._count.id || 0,
      };
    });
  }

  /**
   * Obtiene datos de horarios
   */
  private async getHorariosData(
    complexId: string,
    startDate: string,
    endDate: string,
  ): Promise<HorarioData[]> {
    const startOfPeriod = new Date(startDate + 'T03:00:00.000Z');
    const endOfPeriod = new Date(endDate + 'T02:59:59.999Z');
    endOfPeriod.setDate(endOfPeriod.getDate() + 1);

    const schedulesData = await this.prisma.reserve.groupBy({
      by: ['schedule'],
      where: {
        complexId,
        createdAt: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10, // Top 10 horarios
    });

    return schedulesData
      .filter((scheduleData) => scheduleData.schedule) // Filtrar schedules nulos
      .map((scheduleData) => ({
        hora: scheduleData.schedule.replace(' - ', '-'),
        reservas: scheduleData._count.id || 0,
      }));
  }

  // ===================================
  // MÉTODOS AUXILIARES
  // ===================================

  /**
   * Calcula el rango de fechas (inicio y fin) para un día específico en Argentina (UTC-3)
   * @param date Fecha de referencia
   */
  private getDayRangeUTC3(date: Date): { start: Date; end: Date } {
    // Ajustar a la zona horaria de Argentina (UTC-3)
    const arTime = new Date(date.getTime() - 3 * 60 * 60 * 1000);

    // Extraer componentes YMD
    const year = arTime.getUTCFullYear();
    const month = arTime.getUTCMonth();
    const day = arTime.getUTCDate();

    // Construir el inicio del día en UTC (00:00 AR = 03:00 UTC)
    const start = new Date(Date.UTC(year, month, day, 3, 0, 0, 0));

    // Fin del día (03:00 UTC del día siguiente)
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    return { start, end };
  }

  private async getReservasPorDia(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.prisma.reserve.count({
      where: {
        complexId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
    });
    return count;
  }

  private async getIngresosPorDia(
    complexId: string,
    startDate: Date,
  ): Promise<number> {
    // NUEVA LÓGICA SIMPLIFICADA: Solo usar Payment con horario operativo 06:00-06:00

    // Ajustar a horario operativo real: 06:00 del día hasta 06:00 del día siguiente
    const operationalStart = new Date(startDate);
    operationalStart.setHours(6, 0, 0, 0);

    const operationalEnd = new Date(startDate);
    operationalEnd.setDate(operationalEnd.getDate() + 1);
    operationalEnd.setHours(6, 0, 0, 0);

    // Solo log para hoy
    const isToday = startDate.toDateString() === new Date().toDateString();

    if (isToday) {
      console.log('🔍 [HOY - SIMPLIFICADO] Params:', {
        complexId,
        operationalStart: operationalStart.toISOString(),
        operationalEnd: operationalEnd.toISOString(),
      });
    }

    // UNA SOLA CONSULTA: Sumar todos los pagos (reservas + productos)
    // Excluir EGRESOS (retiros de caja)
    const result = await this.prisma.payment.aggregate({
      where: {
        complexId,
        transactionType: { not: 'EGRESO' },
        createdAt: {
          gte: operationalStart,
          lt: operationalEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const total = result._sum.amount || 0;

    if (isToday) {
      console.log('💵 [HOY - SIMPLIFICADO] TOTAL (06:00-06:00):', total);
    }

    return total;
  }

  private async getCancelacionesPorDia(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.prisma.reserve.count({
      where: {
        complexId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: 'RECHAZADO',
      },
    });
    return count;
  }

  private async getClientesNuevosPorDia(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Obtener clientes únicos que hicieron su primera reserva en este período
    const newClients = await this.prisma.reserve.findMany({
      where: {
        complexId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
      select: {
        phone: true,
        createdAt: true,
      },
      distinct: ['phone'],
    });

    // Verificar cuáles son realmente nuevos
    let reallyNewClients = 0;
    for (const client of newClients) {
      const previousReserve = await this.prisma.reserve.findFirst({
        where: {
          complexId,
          phone: client.phone,
          createdAt: {
            lt: startDate,
          },
        },
      });
      if (!previousReserve) {
        reallyNewClients++;
      }
    }

    return reallyNewClients;
  }

  /**
   * Obtiene el total de egresos (pagos negativos) en un rango de fechas
   */
  async getEgresosTotal(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: {
        complexId,
        transactionType: 'EGRESO',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    // Egresos se guardan como negativos, así que Math.abs
    return Math.abs(result._sum.amount || 0);
  }

  /**
   * Cuenta el número de promociones usadas en un rango de fechas
   */
  async getPromotionsUsedCount(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.prisma.reserve.count({
      where: {
        complexId,
        promotionId: { not: null },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return count;
  }

  /**
   * Cuenta las reservas fijas vs normales usando el campo reserveType
   */
  async getReservasByType(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ fijas: number; normales: number }> {
    const [fijas, normales] = await Promise.all([
      this.prisma.reserve.count({
        where: {
          complexId,
          reserveType: 'FIJO',
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: { notIn: ['RECHAZADO', 'CANCELADO'] },
        },
      }),
      this.prisma.reserve.count({
        where: {
          complexId,
          reserveType: { not: 'FIJO' },
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: { notIn: ['RECHAZADO', 'CANCELADO'] },
        },
      }),
    ]);
    return { fijas, normales };
  }

  /**
   * Obtiene el total de ingresos en un rango
   */
  async getIngresosTotalInRange(
    complexId: string,
    startDate: Date,
    endDate: Date,
    cashSessionId?: string,
  ): Promise<number> {
    // 1. Pagos de reservas
    const payments = await this.prisma.payment.aggregate({
      where: {
        complexId,
        transactionType: { not: 'EGRESO' }, // Todo lo que no sea egreso cuenta como ingreso o movimiento neutral
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(cashSessionId ? { cashSessionId } : {}),
      },
      _sum: {
        amount: true,
      },
    });

    return payments._sum.amount || 0;
  }

  /**
   * Obtiene el total de reservas en un rango
   */
  async getReservasTotalInRange(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.prisma.reserve.count({
      where: {
        complexId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
    });
  }

  /**
   * Calcula el ticket promedio (ingresos totales / número de transacciones)
   */
  private async getAverageTicket(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalReservas = await this.getReservasTotalInRange(
      complexId,
      startDate,
      endDate,
    );

    // Contar ventas de productos
    const productSalesCount = await this.prisma.productSale.count({
      where: {
        complexId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalTransactions = totalReservas + productSalesCount;
    if (totalTransactions === 0) return 0;

    const totalIngresos = await this.getIngresosTotalInRange(
      complexId,
      startDate,
      endDate,
    );

    return Math.round(totalIngresos / totalTransactions);
  }

  /**
   * Calcula el total de horas de cancha reservadas
   */
  private async getTotalCourtHours(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Obtener todas las reservas en el rango
    const reserves = await this.prisma.reserve.findMany({
      where: {
        complexId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
      },
      select: {
        schedule: true, // formato: "10:00 - 11:00"
      },
    });

    let totalHours = 0;

    // Calcular horas basado en los horarios
    for (const reserve of reserves) {
      if (reserve.schedule) {
        const [start, end] = reserve.schedule.split(' - ').map((t) => t.trim());
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);

        const startTotalMinutes = startHour * 60 + startMinute;
        let endTotalMinutes = endHour * 60 + endMinute;

        // Si cruza medianoche
        if (endTotalMinutes <= startTotalMinutes) {
          endTotalMinutes += 24 * 60;
        }

        const durationMinutes = endTotalMinutes - startTotalMinutes;
        totalHours += durationMinutes / 60;
      } else {
        // Si no hay schedule, asumir 1 hora por defecto
        totalHours += 1;
      }
    }

    return totalHours;
  }

  /**
   * Calcula ingresos por hora de cancha
   */
  private async getRevenuePerHour(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalHours = await this.getTotalCourtHours(
      complexId,
      startDate,
      endDate,
    );

    if (totalHours === 0) return 0;

    const totalIngresos = await this.getIngresosTotalInRange(
      complexId,
      startDate,
      endDate,
    );

    return Math.round(totalIngresos / totalHours);
  }

  /**
   * Calcula la tasa de cancelación mejorada
   */
  private async getCancellationRate(
    complexId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const totalReservas = await this.getReservasTotalInRange(
      complexId,
      startDate,
      endDate,
    );

    const totalCancelaciones = await this.prisma.reserve.count({
      where: {
        complexId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CANCELADO',
      },
    });

    const total = totalReservas + totalCancelaciones;
    if (total === 0) return 0;

    return Math.round((totalCancelaciones / total) * 100);
  }

  /**
   * Obtiene las últimas transacciones (reservas, ventas, egresos)
   */
  async getRecentTransactions(complexId: string, limit: number = 10) {
    // Buscar pagos recientes (incluye señas, ventas, egresos)
    // Definimos el include de forma que TypeScript infiera correctamente
    const payments = await this.prisma.payment.findMany({
      where: { complexId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        reserve: {
          select: {
            court: { select: { name: true } },
            schedule: true, // schedule es un string en Reserve
          },
        },
        sale: {
          include: {
            productSales: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    return payments.map((p) => {
      let type: 'reserva' | 'venta' | 'egreso' | 'pago' = 'pago';
      let description = 'Pago o Movimiento';

      if (p.transactionType === 'EGRESO') {
        type = 'egreso';
        description = 'Salida de caja'; // No hay campo notes en Payment actualmente
      } else if (p.transactionType === 'RESERVA' && p.reserve) {
        type = 'reserva';
        description = `${p.reserve.court.name} - ${p.reserve.schedule}`;
      } else if (p.transactionType === 'VENTA_PRODUCTO' && p.sale) {
        type = 'venta';
        const productsCount = p.sale.productSales.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        );
        const firstProduct = p.sale.productSales[0]?.product.name || 'Producto';
        description =
          productsCount > 1
            ? `${firstProduct} +${productsCount - 1}`
            : `${firstProduct} (x${productsCount})`;
      }

      return {
        id: p.id,
        type,
        description,
        amount: p.transactionType === 'EGRESO' ? -p.amount : p.amount,
        date: p.createdAt,
        status: 'completed',
      };
    });
  }
}
