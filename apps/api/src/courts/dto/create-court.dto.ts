import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourtCharacteristics } from '../interfaces/court-characteristics.interface';

export class CreateCourtDto {
  @ApiProperty({
    example: 'Cancha Principal',
    description: 'Nombre de la cancha',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'Número de cancha', required: false })
  @IsOptional()
  courtNumber?: number;

  @ApiProperty({
    example: ['cesped-sintetico', 'iluminacion-nocturna'],
    description: 'Características de la cancha',
  })
  @IsArray()
  characteristics: CourtCharacteristics[];

  @ApiProperty({
    example: true,
    description: 'Indica si la cancha está activa',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: 'Cancha con medidas oficiales',
    description: 'Descripción',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del complejo',
  })
  @IsString()
  @IsNotEmpty()
  complexId: string;

  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del tipo de deporte',
    required: false,
  })
  @IsOptional()
  @IsString()
  sportTypeId?: string;
}
