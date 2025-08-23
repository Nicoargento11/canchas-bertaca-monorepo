import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDateRangeSummaryDto {
  @ApiProperty({
    description: 'Fecha de inicio en formato YYYY-MM-DD',
    example: '2024-01-01',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de inicio debe estar en formato YYYY-MM-DD',
  })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin en formato YYYY-MM-DD',
    example: '2024-01-31',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de fin debe estar en formato YYYY-MM-DD',
  })
  endDate: string;

  @ApiProperty({
    description: 'ID del complejo deportivo',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  complexId: string;
}
