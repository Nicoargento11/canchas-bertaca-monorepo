import { ApiProperty } from '@nestjs/swagger';
import { CourtCharacteristics } from '../interfaces/court-characteristics.interface';

export class CourtResponseDto {
  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID de la cancha',
  })
  id: string;

  @ApiProperty({
    example: 'Cancha Principal',
    description: 'Nombre de la cancha',
  })
  name: string;

  @ApiProperty({ example: 1, description: 'Número de cancha', nullable: true })
  courtNumber: number | null;

  @ApiProperty({
    example: ['cesped-sintetico', 'iluminacion-nocturna'],
    description: 'Características de la cancha',
  })
  characteristics: CourtCharacteristics[];

  @ApiProperty({
    example: true,
    description: 'Indica si la cancha está activa',
  })
  isActive: boolean;

  @ApiProperty({
    example: 'Cancha con medidas oficiales',
    description: 'Descripción',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del complejo',
  })
  complexId: string;

  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del tipo de deporte',
    nullable: true,
  })
  sportTypeId: string | null;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
