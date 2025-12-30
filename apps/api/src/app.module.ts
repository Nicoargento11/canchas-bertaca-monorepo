import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ComplexModule } from './complexs/complexs.module';
import { ReservesModule } from './reserves/reserves.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleDaysModule } from './schedule-days/schedule-days.module';
import { CourtsModule } from './courts/courts.module';
import { SportTypesModule } from './sport-types/sport-types.module';
import { UnavailableDaysModule } from './unavailable-days/unavailable-days.module';
import { RatesModule } from './rates/rates.module';
import { FixedReservesModule } from './fixed-reserves/fixed-reserves.module';
import { ProductsModule } from './products/products.module';
import { ProductSalesModule } from './product-sales/product-sales.module';
import { InventoryMovementsModule } from './inventory-movements/inventory-movements.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesModule } from './schedules/schedules.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CashRegisterModule } from './cash-register/cash-register.module';
import { CashSessionModule } from './cash-session/cash-session.module';
import { ReportsModule } from './reports/reports.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SalesModule } from './sales/sales.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AdminMonitoringModule } from './admin-monitoring/admin-monitoring.module';
import { PromotionsModule } from './promotions/promotions.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ComplexModule,
    OrganizationsModule,
    ReservesModule,
    PaymentsModule,
    ScheduleDaysModule,
    CourtsModule,
    SportTypesModule,
    UnavailableDaysModule,
    ScheduleModule.forRoot(),
    SchedulesModule,
    RatesModule,
    FixedReservesModule,
    ProductsModule,
    ProductSalesModule,
    SalesModule,
    InventoryMovementsModule,
    ReviewsModule,
    CashRegisterModule,
    CashSessionModule,
    CashSessionModule,
    ReportsModule,
    AdminMonitoringModule,
    PromotionsModule,
    PurchaseOrdersModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute default cache
      max: 100, // max items in cache
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
