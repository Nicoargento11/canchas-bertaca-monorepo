import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class MonitoringRangeDto {
  @ApiPropertyOptional({
    description:
      'ISO date string inclusive (UTC recommended). Example: 2025-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'ISO date string exclusive (UTC recommended). Example: 2025-12-14T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description:
      'How many hours until an ACTIVE cash session is considered stale',
    default: 24,
    minimum: 1,
    maximum: 720,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(720)
  staleHours?: number;

  @ApiPropertyOptional({
    description:
      'How many days without reserves/payments until a tenant is considered silent',
    default: 14,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  inactiveDays?: number;

  @ApiPropertyOptional({
    description: 'Optional filter by complexId',
  })
  @IsOptional()
  complexId?: string;

  @ApiPropertyOptional({
    description: 'Optional filter by organizationId',
  })
  @IsOptional()
  organizationId?: string;
}
