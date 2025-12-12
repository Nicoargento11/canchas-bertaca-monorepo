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

  @Get('complex/:complexId')
  async getScheduleDaysByComplex(@Param('complexId') complexId: string) {
    // Automáticamente crea los días si no existen
    return this.scheduleDayService.getScheduleDays(complexId);
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

  @Post('days/initialize/:complexId')
  async initializeScheduleDays(@Param('complexId') complexId: string) {
    await this.scheduleDayService.ensureScheduleDaysExist(complexId);
    return { message: 'Días de la semana inicializados correctamente' };
  }
}
