import { PaymentMethod, SportName } from '@prisma/client';

export interface DailySummaryByCourt {
  courtId: string;
  courtName: string;
  courtNumber: number | null;
  sportType: SportName;
  sportTypeName: string;
  totalRevenue: number;
  totalReservations: number;
  totalReservationAmount: number; // Seña/adelanto
  totalPaid: number; // Pagos efectivamente realizados
  paymentsByMethod: {
    method: PaymentMethod;
    amount: number;
    count: number;
  }[];
  reservations: {
    id: string;
    schedule: string;
    clientName: string | null;
    phone: string;
    status: string;
    price: number;
    reservationAmount: number;
    totalPaid: number;
  }[];
}

export interface DailyProductSales {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  sales: {
    id: string;
    quantity: number;
    price: number;
    discount: number | null;
    isGift: boolean;
    soldAt: Date;
    paymentMethod: PaymentMethod;
  }[];
}

export interface DailySummaryResponse {
  date: string;
  complexId: string;
  complexName: string;
  courts: DailySummaryByCourt[];
  products: DailyProductSales[];
  totals: {
    totalRevenueReserves: number;
    totalRevenueProducts: number;
    totalRevenue: number;
    totalReservations: number;
    totalProductsSold: number;
    paymentMethodSummary: {
      method: PaymentMethod;
      amount: number;
      count: number;
    }[];
  };
}
