import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class FilterReviewsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  minRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
