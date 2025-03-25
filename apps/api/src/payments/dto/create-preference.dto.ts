import { CreatePaymentDto } from './create-payment.dto'; // Importa el DTO original
import { IsString } from 'class-validator';

export class CreatePreferenceDto extends CreatePaymentDto {
  @IsString()
  reserveId?: string; // Nueva propiedad opcional
}
