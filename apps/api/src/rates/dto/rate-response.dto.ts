import { ApiProperty } from '@nestjs/swagger';

export class RateResponseDto {
  @ApiProperty({ description: 'ID de la tarifa' })
  id: string;

  @ApiProperty({ description: 'Nombre de la tarifa' })
  name: string;

  @ApiProperty({ description: 'Precio de la tarifa' })
  price: number;

  @ApiProperty({ description: 'Monto de reserva' })
  reservationAmount: number;

  @ApiProperty({ description: 'ID del complejo', required: false })
  complexId: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
