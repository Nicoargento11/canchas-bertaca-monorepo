import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateRateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  reservationAmount: number;
}
