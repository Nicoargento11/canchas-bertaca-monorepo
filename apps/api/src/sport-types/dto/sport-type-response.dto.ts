import { ApiProperty } from '@nestjs/swagger';

export class SportTypeResponseDto {
  @ApiProperty({
    example: 'cln3j8h4d00003b6q1q2q3q4q',
    description: 'ID del tipo de deporte',
  })
  id: string;

  @ApiProperty({
    example: 'Fútbol 5',
    description: 'Nombre del tipo de deporte',
  })
  name: string;

  @ApiProperty({
    example: 'Fútbol en cancha de 5 jugadores por equipo',
    description: 'Descripción del deporte',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'https://example.com/futbol5.png',
    description: 'URL de la imagen representativa',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si el tipo de deporte está activo',
  })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
