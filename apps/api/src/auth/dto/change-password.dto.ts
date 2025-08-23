import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'MiViejaContraseña123',
    minLength: 8,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'MiNuevaContraseña456',
    minLength: 8,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
