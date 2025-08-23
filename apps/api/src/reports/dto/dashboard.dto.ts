import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetDashboardDataDto {
  @ApiProperty({
    description: 'ID del complejo deportivo',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  complexId: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio en formato YYYY-MM-DD',
    example: '2024-01-01',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de inicio debe estar en formato YYYY-MM-DD',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin en formato YYYY-MM-DD',
    example: '2024-01-31',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de fin debe estar en formato YYYY-MM-DD',
  })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'ID de la sesión de caja específica',
    example: 'cashSession1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  cashSessionId?: string;
}
