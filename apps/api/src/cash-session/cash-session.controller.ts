// src/cash-session/cash-session.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CashSessionService } from './cash-session.service';
import { CreateCashSessionDto } from './dto/create-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';

@Controller('cash-sessions')
export class CashSessionController {
  constructor(private readonly cashSessionService: CashSessionService) {}

  @Post('open')
  openSession(@Body() createCashSessionDto: CreateCashSessionDto) {
    return this.cashSessionService.openSession(createCashSessionDto);
  }

  @Post(':id/close')
  closeSession(
    @Param('id') id: string,
    @Body() closeCashSessionDto: CloseCashSessionDto,
  ) {
    return this.cashSessionService.closeSession(id, closeCashSessionDto);
  }

  @Get('active')
  getActiveSession(@Query('cashRegisterId') cashRegisterId: string) {
    if (!cashRegisterId) {
      throw new NotFoundException('cashRegisterId es requerido');
    }
    return this.cashSessionService.getActiveSession(cashRegisterId);
  }

  @Get('user/active')
  getActiveSessionByUser(
    @Query('userId') userId: string,
    @Query('complexId') complexId?: string,
  ) {
    if (!userId) {
      throw new NotFoundException('userId es requerido');
    }
    return this.cashSessionService.getActiveSessionByUser(userId, complexId);
  }

  @Get(':id/summary')
  getSessionSummary(@Param('id') id: string) {
    return this.cashSessionService.getSessionSummary(id);
  }

  @Get('history')
  getSessionHistory(
    @Query('cashRegisterId') cashRegisterId: string,
    @Query('days') days: number,
  ) {
    return this.cashSessionService.findSessionHistory(
      cashRegisterId,
      days ? Number(days) : 30,
    );
  }

  @Get('complex/:complexId')
  getSessionsByComplex(@Param('complexId') complexId: string) {
    return this.cashSessionService.getSessionsByComplex(complexId);
  }
}
