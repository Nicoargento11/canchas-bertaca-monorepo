import { CreatePaymentOnlineDto } from './create-payment.dto'; // Importa el DTO original
import { IsString } from 'class-validator';

export class CreatePreferenceDto extends CreatePaymentOnlineDto {
  @IsString()
  reserveId?: string; // Nueva propiedad opcional
}
