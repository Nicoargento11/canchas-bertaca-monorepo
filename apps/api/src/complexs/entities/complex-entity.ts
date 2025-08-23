import { Complex } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ComplexEntity implements Partial<Complex> {
  @ApiProperty({ description: 'ID único del complejo' })
  id: string;

  @ApiProperty({ description: 'Nombre del complejo' })
  name: string;

  @ApiProperty({ description: 'Dirección del complejo' })
  address: string;

  @ApiProperty({
    description: 'Ruta del complejo',
  })
  slug: string;

  @ApiProperty({
    description: 'Indica si el complejo está activo',
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Servicios disponibles en el complejo',
    type: [String],
  })
  services: string[];

  @ApiProperty({
    description: 'ID de la organización a la que pertenece',
    required: false,
  })
  organizationId?: string;

  @ApiProperty({ description: 'Fecha de creación', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización', type: Date })
  updatedAt: Date;

  constructor(partial: Partial<ComplexEntity>) {
    Object.assign(this, partial);
  }
}
