import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationParams {
  @ApiProperty({
    required: false,
    default: 1,
    description: 'Número de página',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Límite de resultados por página',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit = 10;
}
