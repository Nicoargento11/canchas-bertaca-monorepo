import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Contraseña del usuario',
    required: true,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
