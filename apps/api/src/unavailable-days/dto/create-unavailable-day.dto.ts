import {
  IsDateString,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateUnavailableDayDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
