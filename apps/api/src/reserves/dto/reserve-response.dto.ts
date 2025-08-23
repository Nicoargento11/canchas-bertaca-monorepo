import { Status, ReserveType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReserveResponseDto {
  @ApiProperty({
    description: 'Reservation ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  id: string;

  @ApiProperty({
    description: 'Date of reservation',
    example: '2023-12-25T10:00:00Z',
  })
  date: Date;

  @ApiProperty({ description: 'Time schedule', example: '10:00-11:00' })
  schedule: string;

  @ApiProperty({ description: 'Price of reservation', example: 5000 })
  price: number;

  @ApiProperty({ description: 'Amount paid for reservation', example: 2500 })
  reservationAmount: number;

  @ApiProperty({
    description: 'Current status',
    enum: Status,
    example: 'PENDIENTE',
  })
  status: Status;

  @ApiProperty({
    description: 'Client phone number',
    example: '+5491123456789',
  })
  phone: string;

  @ApiProperty({ description: 'Client name', example: 'John Doe' })
  clientName: string;

  @ApiPropertyOptional({
    description: 'Type of reservation',
    enum: ReserveType,
  })
  reserveType?: ReserveType;

  @ApiPropertyOptional({
    description: 'Payment URL if available',
    example: 'https://payment.link/123',
  })
  paymentUrl?: string;

  @ApiPropertyOptional({
    description: 'Payment ID if available',
    example: 'pay_123456789',
  })
  paymentId?: string;

  @ApiPropertyOptional({
    description: 'Payment token if available',
    example: 'token_123456789',
  })
  paymentToken?: string;

  @ApiProperty({
    description: 'Court ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  courtId: string;

  @ApiProperty({
    description: 'User ID who made the reservation',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Fixed reserve ID if applicable',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  fixedReserveId?: string;

  @ApiProperty({
    description: 'Complex ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  complexId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-20T15:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-20T15:30:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({ type: Object, description: 'Court details' })
  court?: {
    id: string;
    name: string;
    // other court fields
  };

  @ApiPropertyOptional({ type: Object, description: 'User details' })
  user?: {
    id: string;
    name: string;
    // other user fields
  };

  @ApiPropertyOptional({ type: Object, description: 'Complex details' })
  complex?: {
    id: string;
    name: string;
    // other complex fields
  };
}
