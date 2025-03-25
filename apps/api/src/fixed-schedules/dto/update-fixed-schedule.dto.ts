import { PartialType } from '@nestjs/swagger';
import { CreateFixedScheduleDto } from './create-fixed-schedule.dto';

export class UpdateFixedScheduleDto extends PartialType(
  CreateFixedScheduleDto,
) {}
