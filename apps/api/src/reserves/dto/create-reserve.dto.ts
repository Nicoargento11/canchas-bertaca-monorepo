import { ReserveType, Status } from '@prisma/client';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReserveDto {
  @ApiProperty({
    description: 'Date of the reservation',
    example: '2023-12-25T10:00:00Z',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    description: 'Time schedule of the reservation',
    example: '10:00-11:00',
  })
  @IsString()
  @Matches(/^\d{2}:\d{2} - \d{2}:\d{2}$/)
  schedule: string;

  @ApiProperty({ description: 'Price of the reservation', example: 5000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Amount paid for reservation', example: 2500 })
  @IsNumber()
  reservationAmount: number;

  @ApiPropertyOptional({
    description: 'Status of the reservation',
    enum: Status,
    default: 'PENDIENTE',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    description: 'Client phone number',
    example: '+5491123456789',
  })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Client name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Type of reservation',
    enum: ReserveType,
  })
  @IsOptional()
  @IsEnum(ReserveType)
  reserveType?: ReserveType;

  @ApiProperty({
    description: 'ID of the court being reserved',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  courtId: string;

  @ApiProperty({
    description: 'ID of the user making the reservation',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'ID of fixed reserve if applicable',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsOptional()
  @IsString()
  fixedReserveId?: string;

  @ApiProperty({
    description: 'ID of the complex',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsString()
  complexId: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'ID of the promotion to apply',
    example: 'cln3j8h4d00003b6q1q2q3q4q',
  })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiPropertyOptional({
    description: 'Notes or metadata for the reservation (can be JSON string)',
    example: '{"eventGroupId": "event-123", "comboId": "combo-1"}',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
