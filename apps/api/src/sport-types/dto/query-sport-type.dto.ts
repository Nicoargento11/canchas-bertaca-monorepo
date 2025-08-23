import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class QuerySportTypeDto {
  @ApiProperty({
    example: 'Fútbol',
    description: 'Buscar por nombre de deporte',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: true,
    description: 'Filtrar por estado activo/inactivo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
