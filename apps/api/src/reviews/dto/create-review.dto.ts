import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  @IsNotEmpty({ message: 'La calificación es requerida' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(500, {
    message: 'El comentario no puede exceder los 500 caracteres',
  })
  comment: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email proporcionado no es válido' })
  @MaxLength(100, { message: 'El email no puede exceder los 100 caracteres' })
  email?: string;
}
