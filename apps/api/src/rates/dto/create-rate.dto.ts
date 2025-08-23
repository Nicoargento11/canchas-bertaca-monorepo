import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateRateDto {
  @ApiProperty({
    description: 'ID del complejo',
    example: 'uuid',
  })
  @IsString()
  complexId: string;

  @ApiProperty({
    description: 'Nombre de la tarifa',
    example: 'Tarifa estándar',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Precio de la tarifa', example: 1000 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Monto de reserva', example: 200 })
  @IsNumber()
  reservationAmount: number;
}
