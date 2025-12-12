import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class CreateComplexDto {
  @ApiProperty({
    description: 'Nombre del complejo',
    example: 'Complejo Deportivo Central',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Dirección del complejo',
    example: 'Av. Siempreviva 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'ruta del complejo',
    example: 'complejo-deportivo-central',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Email del complejo',
    example: 'contacto@complejo.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Servicios disponibles',
    example: ['vestuarios', 'cafetería'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  services?: string[];

  @ApiProperty({
    description: 'ID de la organización propietaria',
    required: false,
  })
  @IsString()
  @IsOptional()
  organizationId?: string;
}
