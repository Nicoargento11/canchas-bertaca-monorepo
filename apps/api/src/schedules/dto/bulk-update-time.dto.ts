import { IsString, IsNotEmpty, IsIn, Matches } from 'class-validator';

export class BulkUpdateTimeDto {
  @IsString()
  @IsNotEmpty()
  complexId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (HH:MM)',
  })
  oldTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (HH:MM)',
  })
  newTime: string;

  @IsString()
  @IsIn(['startTime', 'endTime', 'both'])
  field: 'startTime' | 'endTime' | 'both';
}
