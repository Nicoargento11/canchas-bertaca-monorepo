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
  // KPIs de Negocio
  averageTicket: number;
  revenuePerHour: number;
  totalCourtHours: number;
  cancellationRate: number;
  netMargin: number;
  netMarginPercentage: number;
  // Comparación KPIs período anterior
  previousAverageTicket: number;
  previousRevenuePerHour: number;
  previousCancellationRate: number;
  previousNetMargin: number;
  previousNetMarginPercentage: number;
  // Inventario y análisis de productos
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
    category: string;
    status: string;
  }>;
  highMarginProducts: Array<{
    id: string;
    name: string;
    costPrice: number;
    salePrice: number;
    margin: number;
    marginPercentage: number;
    category: string;
    stock: number;
  }>;
  deadStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category: string;
    tiedUpCapital: number;
  }>;
  // Análisis de clientes
  topCustomers: Array<{
    userId: string;
    name: string;
    phone: string | null;
    totalSpent: number;
    reservations: number;
    averageTicket: number;
  }>;
  customerSegmentation: {
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
    newCustomerPercentage: number;
  };
  inactiveCustomers: Array<{
    userId: string;
    name: string;
    phone: string | null;
    lastReserveDate: Date;
    daysSinceLastReserve: number;
  }>;
  problematicCustomers: Array<{
    userId: string;
    name: string;
    phone: string | null;
    totalReservations: number;
    canceledReservations: number;
    rejectedReservations: number;
    approvedReservations: number;
    cancellationRate: number;
    rejectionRate: number;
    problemScore: number;
  }>;
}

export interface RecentTransaction {
  id: string;
  type: 'reserva' | 'venta' | 'egreso' | 'pago';
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
