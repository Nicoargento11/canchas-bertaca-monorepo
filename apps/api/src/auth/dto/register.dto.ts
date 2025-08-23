import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    required: true,
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '+5491122334455',
    description: 'Teléfono del usuario (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
