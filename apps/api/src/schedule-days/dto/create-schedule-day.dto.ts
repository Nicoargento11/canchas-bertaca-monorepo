import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator';

export class CreateScheduleDayDto {
  @IsInt()
  @IsNotEmpty()
  dayOfWeek: number; // 0 = Sunday, ..., 6 = Saturday

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
