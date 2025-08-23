import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateCourtDto } from './create-court.dto';
import { CourtCharacteristics } from '../interfaces/court-characteristics.interface';

export class UpdateCourtDto extends PartialType(CreateCourtDto) {
  @ApiProperty({
    example: ['cesped-sintetico', 'iluminacion-nocturna'],
    description: 'Características de la cancha',
    required: false,
  })
  @IsOptional()
  @IsArray()
  characteristics?: CourtCharacteristics[];
}
