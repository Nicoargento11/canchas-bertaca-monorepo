// src/unavailable-days/unavailable-day.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { UnavailableDayService } from './unavailable-days.service';
import { CreateUnavailableDayDto } from './dto/create-unavailable-day.dto';
import { UpdateUnavailableDayDto } from './dto/update-unavailable-day.dto';

@Controller('unavailable-days')
export class UnavailableDayController {
  constructor(private readonly unavailableDayService: UnavailableDayService) {}

  @Post()
  create(@Body() createUnavailableDayDto: CreateUnavailableDayDto) {
    return this.unavailableDayService.create(createUnavailableDayDto);
  }
  // @Public()
  @Get()
  findAll(@Query('complexId') complexId?: string) {
    return this.unavailableDayService.findAll(complexId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unavailableDayService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnavailableDayDto: UpdateUnavailableDayDto,
  ) {
    return this.unavailableDayService.update(id, updateUnavailableDayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unavailableDayService.remove(id);
  }

  @Delete('date/:date')
  removeByDate(@Param('date') date: Date) {
    return this.unavailableDayService.removeByDate(date);
  }
}
