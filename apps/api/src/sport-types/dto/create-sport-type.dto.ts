import { ApiProperty } from '@nestjs/swagger';
import { SportName } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSportTypeDto {
  @ApiProperty({
    example: 'Fútbol 5',
    description: 'Nombre del tipo de deporte',
  })
  @IsEnum(SportName)
  @IsNotEmpty()
  name: SportName;

  @ApiProperty({
    example: 'Fútbol en cancha de 5 jugadores por equipo',
    description: 'Descripción del deporte',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/futbol5.png',
    description: 'URL de la imagen representaativa',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el tipo de deporte está activo',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del complejo',
  })
  @IsString()
  @IsNotEmpty()
  complexId: string;
}
