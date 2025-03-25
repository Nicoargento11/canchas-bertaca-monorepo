import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  @IsNotEmpty()
  clientType: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsInt()
  @IsNotEmpty()
  discount: number;
}
