import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from '@prisma/client';

export class PromotionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  validFrom?: Date;

  @ApiPropertyOptional()
  validTo?: Date;

  @ApiProperty({ type: [Number] })
  daysOfWeek: number[];

  @ApiPropertyOptional()
  startTime?: string;

  @ApiPropertyOptional()
  endTime?: string;

  @ApiProperty()
  complexId: string;

  @ApiPropertyOptional()
  sportTypeId?: string;

  @ApiPropertyOptional()
  courtId?: string;

  @ApiProperty({ enum: PromotionType })
  type: PromotionType;

  @ApiPropertyOptional()
  value?: number;

  @ApiPropertyOptional()
  giftProductId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relaciones opcionales
  @ApiPropertyOptional()
  complex?: any;

  @ApiPropertyOptional()
  sportType?: any;

  @ApiPropertyOptional()
  court?: any;

  @ApiPropertyOptional()
  giftProduct?: any;
}
