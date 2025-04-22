import { PartialType } from '@nestjs/swagger';
import { CreateUnavailableDayDto } from './create-unavailable-day.dto';

export class UpdateUnavailableDayDto extends PartialType(
  CreateUnavailableDayDto,
) {}
