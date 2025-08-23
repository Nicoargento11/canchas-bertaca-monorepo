import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, ReserveType, TransactionType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentOnlineDto {
  @ApiProperty({
    description: 'Fecha de la reserva',
    example: '2023-12-25T10:00:00Z',
  })
  @IsISO8601()
  date: Date;

  @ApiProperty({
    description: 'Horario de la reserva',
    example: '10:00-11:00',
  })
  @IsString()
  schedule: string;

  @ApiProperty({
    description: 'ID de la cancha',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  courtId: string;

  @ApiProperty({ description: 'Precio total', example: 5000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Monto de reserva', example: 2500 })
  @IsNumber()
  reservationAmount: number;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+5491123456789',
  })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID del complejo',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  complexId: string;

  @ApiPropertyOptional({
    description: 'Tipo de reserva',
    enum: ReserveType,
  })
  @IsOptional()
  @IsEnum(ReserveType)
  reserveType?: ReserveType;

  @ApiPropertyOptional({
    description: 'ID de reserva fija si aplica',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsOptional()
  @IsString()
  fixedReserveId?: string;
}

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsBoolean()
  @IsNotEmpty()
  isPartial: boolean;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  transactionType: TransactionType;

  @IsOptional()
  @IsNotEmpty()
  reserveId?: string;

  @IsOptional()
  @IsNotEmpty()
  complexId?: string;

  @IsOptional()
  @IsNotEmpty()
  cashSessionId?: string;
}

export class PaymentPreferenceResponseDto {
  @ApiProperty({ description: 'ID de la preferencia de pago' })
  id: string;

  @ApiProperty({ description: 'URL de inicio de pago' })
  init_point: string;

  @ApiProperty({ description: 'ID de la reserva creada' })
  reserveId: string;

  @ApiProperty({ description: 'Token de pago para verificación' })
  paymentToken: string;
}
