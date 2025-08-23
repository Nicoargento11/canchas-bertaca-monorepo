// src/cash-register/cash-register.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { CreateCashRegisterDto } from './dto/create-cash-register.dto';
import { UpdateCashRegisterDto } from './dto/update-cash-register.dto';

@Controller('cash-registers')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post()
  create(@Body() createCashRegisterDto: CreateCashRegisterDto) {
    return this.cashRegisterService.create(createCashRegisterDto);
  }

  @Get()
  findAll(@Query('complexId') complexId: string) {
    return this.cashRegisterService.findAll(complexId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashRegisterService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCashRegisterDto: UpdateCashRegisterDto,
  ) {
    return this.cashRegisterService.update(id, updateCashRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashRegisterService.remove(id);
  }
}
