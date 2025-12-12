import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveMercadoPagoConfigDto {
  @ApiProperty({
    description: 'Access Token de MercadoPago',
    example: 'APP_USR-1234567890-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: 'Public Key de MercadoPago',
    example: 'APP_USR-1234567890-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @ApiProperty({
    description: 'Client ID de la aplicación de MercadoPago',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    description: 'Client Secret de la aplicación de MercadoPago',
    example: 'abc123def456',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientSecret?: string;
}
