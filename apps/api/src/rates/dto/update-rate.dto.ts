import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateRateDto } from './create-rate.dto';

export class UpdateRateDto extends PartialType(CreateRateDto) {
  @ApiProperty({ description: 'Estado activo/inactivo', required: false })
  isActive?: boolean;
}
