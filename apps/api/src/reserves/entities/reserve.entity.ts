// src/reserves/entities/reserve.entity.ts
import { Reserve as PrismaReserve, Status, ReserveType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
// import { CourtEntity } from '../../courts/entities/court.entity';
import { UserEntity } from '../../users/entities/user.entity';
// import { PaymentEntity } from '../../payments/entities/payment.entity';
// import { ProductSaleEntity } from '../../inventory/entities/product-sale.entity';

export class ReserveEntity implements PrismaReserve {
  @ApiProperty({ description: 'ID de la reserva' })
  id: string;

  @ApiProperty({ type: Date, description: 'Fecha de la reserva' })
  date: Date;

  @ApiProperty({ example: '18:00', description: 'Horario de la reserva' })
  schedule: string;

  @ApiProperty({ required: false, description: 'Precio final de la reserva' })
  price: number | null;

  @ApiProperty({ required: false, description: 'Seña/adelanto pagado' })
  reservationAmount: number | null;

  @ApiProperty({ enum: Status, default: 'PENDIENTE' })
  status: Status;

  @ApiProperty({ required: false, description: 'Teléfono del cliente' })
  phone: string | null;

  @ApiProperty({ description: 'Nombre del cliente/reservante' })
  clientName: string;

  @ApiProperty({ enum: ReserveType, required: false })
  reserveType: ReserveType | null;

  @ApiProperty({ required: false, description: 'URL de pago (MercadoPago)' })
  paymentUrl: string | null;

  @ApiProperty({ required: false, description: 'ID externo del pago' })
  paymentIdExt: string | null;

  @ApiProperty({ required: false, description: 'Token único de pago' })
  paymentToken: string | null;

  //   @ApiProperty({ type: () => CourtEntity })
  //   court: CourtEntity;
  courtId: string;

  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;
  userId: string;

  @ApiProperty({ required: false })
  fixedReserveId: string | null;

  @ApiProperty()
  complexId: string;

  //   @ApiProperty({ type: () => [PaymentEntity] })
  //   payment: PaymentEntity[];

  //   @ApiProperty({ type: () => [ProductSaleEntity] })
  //   ProductSale: ProductSaleEntity[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  expiresAt: Date | null;

  @ApiProperty({ required: false, description: 'ID de la promoción aplicada' })
  promotionId: string | null;

  @ApiProperty({ required: false, description: 'ID del paquete de evento' })
  eventPackageId: string | null;

  @ApiProperty({ required: false, description: 'Notas/metadata (JSON string)' })
  notes: string | null;
}
