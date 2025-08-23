import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-4]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (HH:MM)',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-4]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (HH:MM)',
  })
  endTime: string;

  @IsString()
  scheduleDayId: string;

  @IsString()
  complexId?: string;

  @IsString()
  @IsOptional()
  courtId?: string;

  @IsString()
  rateId: string;

  @IsString()
  sportTypeId: string;
}
