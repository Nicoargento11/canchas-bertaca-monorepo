// src/schedules/dto/create-schedule.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  scheduleDay: number;

  @IsOptional()
  @Type(() => String) // Asegura que el valor sea transformado a string
  rates?: string | string[]; // Puede ser una sola tarifa o un array de tarifas

  @IsArray()
  @IsString({ each: true }) // Valida que cada elemento sea un string
  @IsOptional() // Opcional porque se puede crear sin beneficios
  benefits?: string[];
}
