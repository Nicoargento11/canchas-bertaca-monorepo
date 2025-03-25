// backend/src/fixed-schedules/fixed-schedules.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FixedSchedulesService } from './fixed-schedules.service';
import { CreateFixedScheduleDto } from './dto/create-fixed-schedule.dto';
import { UpdateFixedScheduleDto } from './dto/update-fixed-schedule.dto';

@Controller('fixed-schedules')
export class FixedSchedulesController {
  constructor(private readonly fixedSchedulesService: FixedSchedulesService) {}

  @Post()
  create(@Body() createFixedScheduleDto: CreateFixedScheduleDto) {
    return this.fixedSchedulesService.create(createFixedScheduleDto);
  }

  @Get()
  findAll() {
    return this.fixedSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fixedSchedulesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFixedScheduleDto: UpdateFixedScheduleDto,
  ) {
    return this.fixedSchedulesService.update(id, updateFixedScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fixedSchedulesService.remove(id);
  }

  @Put(':id/toggle')
  toggle(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.fixedSchedulesService.toggle(id, isActive);
  }
}
