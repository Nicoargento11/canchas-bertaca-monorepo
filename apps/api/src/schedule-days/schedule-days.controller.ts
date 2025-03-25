import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ScheduleDayService } from './schedule-days.service';
import { CreateScheduleDayDto } from './dto/create-schedule-day.dto';
import { UpdateScheduleDayDto } from './dto/update-schedule-day.dto';

@Controller('schedule-days')
export class ScheduleDayController {
  constructor(private readonly scheduleDayService: ScheduleDayService) {}

  @Post()
  create(@Body() createScheduleDayDto: CreateScheduleDayDto) {
    return this.scheduleDayService.create(createScheduleDayDto);
  }

  @Get()
  findAll() {
    return this.scheduleDayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleDayService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDayDto: UpdateScheduleDayDto,
  ) {
    return this.scheduleDayService.update(id, updateScheduleDayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleDayService.remove(id);
  }
}
