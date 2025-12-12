import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMercadoPagoConfigDto {
  @ApiProperty({
    description: 'Access Token de MercadoPago',
    example: 'APP_USR-1234567890-123456-1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  mpAccessToken?: string;

  @ApiProperty({
    description: 'Public Key de MercadoPago',
    example: 'APP_USR-1234567890-123456-1234567890abcdef-123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  mpPublicKey?: string;

  @ApiProperty({
    description: 'Integrator ID de MercadoPago',
    example: 'dev_24c65fb163bf11ea96500242ac130004',
    required: false,
  })
  @IsOptional()
  @IsString()
  mpIntegratorId?: string;
}
