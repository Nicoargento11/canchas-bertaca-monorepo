import { Complex, Court } from '@prisma/client';
import { CreatePaymentOnlineDto } from './create-payment.dto'; // Importa el DTO original
import { IsString } from 'class-validator';

export class CreatePreferenceDto extends CreatePaymentOnlineDto {
  @IsString()
  reserveId?: string; // Nueva propiedad opcional

  court: Court; // Nueva propiedad opcional

  complex: Complex;
}
