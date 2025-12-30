import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { Status, ReserveType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReserveDto {
  @ApiPropertyOptional({
    description: 'New date of the reservation',
    example: '2023-12-25T11:00:00Z',
  })
  @IsDateString()
  date: Date;

  @ApiPropertyOptional({
    description: 'New time schedule',
    example: '11:00-12:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2} - \d{2}:\d{2}$/)
  schedule: string;

  @ApiPropertyOptional({ description: 'Updated price', example: 5500 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    description: 'Updated reservation amount',
    example: 2750,
  })
  @IsOptional()
  @IsNumber()
  reservationAmount?: number;

  @ApiPropertyOptional({ description: 'Updated status', enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    description: 'Updated phone number',
    example: '+5491123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Updated client name',
    example: 'John Smith',
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Updated reserve type',
    enum: ReserveType,
  })
  @IsOptional()
  @IsEnum(ReserveType)
  reserveType?: ReserveType;

  @ApiPropertyOptional({
    description: 'Payment URL if available',
    example: 'https://payment.link/123',
  })
  @IsOptional()
  @IsString()
  paymentUrl?: string;

  @ApiPropertyOptional({
    description: 'Payment ID if available',
    example: 'pay_123456789',
  })
  @IsOptional()
  @IsString()
  paymentIdExt?: string;

  @ApiPropertyOptional({
    description: 'Payment token if available',
    example: 'token_123456789',
  })
  @IsOptional()
  @IsString()
  paymentToken?: string;

  @ApiPropertyOptional({
    description: 'Updated court ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsOptional()
  @IsString()
  courtId: string;

  @ApiPropertyOptional({
    description: 'Updated user ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Updated fixed reserve ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsOptional()
  @IsString()
  fixedReserveId?: string;

  @ApiPropertyOptional({
    description: 'Updated complex ID',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  complexId: string;

  @ApiPropertyOptional({
    description: 'Updated notes or metadata',
    example: '{"eventGroupId": "event-123"}',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
