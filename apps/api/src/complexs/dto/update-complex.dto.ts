import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateComplexDto } from './create-complex.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateComplexDto extends PartialType(CreateComplexDto) {
  @ApiProperty({
    description: 'Indica si el complejo está activo',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
