export interface DailyData {
  day: string;
  reservas: number;
  ingresos: number;
  diaAnterior: number;
  cancelaciones: number;
  ocupacion: number;
  clientesNuevos: number;
}

export interface WeeklyData {
  week: string;
  reservas: number;
  ingresos: number;
  semanaAnterior: number;
  ocupacion: number;
  clientesNuevos: number;
}

export interface MonthlyData {
  month: string;
  reservas: number;
  ingresos: number;
  mesAnterior: number;
  ocupacion: number;
  clientesNuevos: number;
}

export interface ProductData {
  name: string;
  sales: number;
  category: string;
}

export interface PaymentMethodData {
  name: string;
  value: number;
}

export interface CanchaData {
  name: string;
  reservas: number;
}

export interface HorarioData {
  hora: string;
  reservas: number;
}

export interface DashboardData {
  daily: DailyData[];
  weekly: WeeklyData[];
  monthly: MonthlyData[];
  products: ProductData[];
  paymentMethods: PaymentMethodData[];
  canchas: CanchaData[];
  horarios: HorarioData[];
  // Nuevas estadísticas
  totalEgresos: number;
  promotionsUsed: number;
  reservasFijas: number;
  reservasNormales: number;
  // Comparaciones con período anterior
  previousIngresos: number;
  previousReservas: number;
  previousEgresos: number;
  // Transacciones recientes
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  type: "reserva" | "venta" | "egreso" | "pago";
  description: string;
  amount: number;
  date: Date;
  status: string;
}

// DTOs para los endpoints
export interface GetDashboardDataDto {
  complexId: string;
  startDate?: string;
  endDate?: string;
  cashSessionId?: string;
}
