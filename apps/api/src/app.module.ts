import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { ConfigModule } from '@nestjs/config';
import { ReservesModule } from './reserves/reserves.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CourtsModule } from './courts/courts.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ScheduleDaysModule } from './schedule-days/schedule-days.module';
import { BenefitsModule } from './benefits/benefits.module';
import { RatesModule } from './rates/rates.module';
import { UnavailableDaysModule } from './unavailable-days/unavailable-days.module';
import { FixedSchedulesModule } from './fixed-schedules/fixed-schedules.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProductsModule } from './product/products.module';
import { ProductSalesModule } from './product-sales/product-sales.module';
import { InventoryMovementsModule } from './inventory-movements/inventory-movements.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ReservesModule,
    PaymentsModule,
    CourtsModule,
    SchedulesModule,
    ScheduleDaysModule,
    BenefitsModule,
    RatesModule,
    UnavailableDaysModule,
    FixedSchedulesModule,
    ReviewsModule,
    ProductsModule,
    ProductSalesModule,
    InventoryMovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
