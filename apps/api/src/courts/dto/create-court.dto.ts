import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourtDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  numberCourts: number;

  @IsOptional()
  @IsNumber()
  reservationAmount: number;
}
