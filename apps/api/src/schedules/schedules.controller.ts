import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkUpdateTimeDto } from './dto/bulk-update-time.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly scheduleService: SchedulesService) {}

  @Patch('bulk-update-time')
  bulkUpdateTime(@Body() dto: BulkUpdateTimeDto) {
    return this.scheduleService.bulkUpdateTime(dto);
  }

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
