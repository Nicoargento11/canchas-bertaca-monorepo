// src/benefits/benefit.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BenefitService } from './benefits.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Controller('benefits')
export class BenefitController {
  constructor(private readonly benefitService: BenefitService) {}

  @Post()
  create(@Body() createBenefitDto: CreateBenefitDto) {
    return this.benefitService.create(createBenefitDto);
  }

  @Get()
  findAll() {
    return this.benefitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.benefitService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBenefitDto: UpdateBenefitDto) {
    return this.benefitService.update(id, updateBenefitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.benefitService.remove(id);
  }
}
