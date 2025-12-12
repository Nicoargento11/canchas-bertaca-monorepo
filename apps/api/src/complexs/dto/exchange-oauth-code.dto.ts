import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeOAuthCodeDto {
  @ApiProperty({
    description: 'Código OAuth recibido de MercadoPago',
    example: 'TG-69387ce5e26e4c0001dfab9-1447686092',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'URL de redirect configurada',
    example: 'https://miapp.com/complejo/dashboard/payments',
  })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}
