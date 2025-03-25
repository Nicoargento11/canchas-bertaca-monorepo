import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDayDto } from './create-schedule-day.dto';

export class UpdateScheduleDayDto extends PartialType(CreateScheduleDayDto) {}
