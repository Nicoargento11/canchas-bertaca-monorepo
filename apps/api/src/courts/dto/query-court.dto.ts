import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class QueryCourtDto {
  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del complejo para filtrar',
    required: false,
  })
  @IsOptional()
  @IsString()
  complexId?: string;

  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del tipo de deporte para filtrar',
    required: false,
  })
  @IsOptional()
  @IsString()
  sportTypeId?: string;

  @ApiProperty({
    example: true,
    description: 'Filtrar por canchas activas/inactivas',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 'futbol',
    description: 'Buscar por nombre de cancha',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
