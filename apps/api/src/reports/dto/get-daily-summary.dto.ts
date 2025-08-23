import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDailySummaryDto {
  @ApiProperty({
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-01-15',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe estar en formato YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    description: 'ID del complejo deportivo',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  complexId: string;

  @ApiProperty({
    description: 'ID de la sesión de caja',
    example: 'cashSession1234567890abcdef',
  })
  @IsOptional()
  cashSessionId: string;
}
