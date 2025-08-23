// src/fixed-reserves/fixed-reserves.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FixedReservesService } from './fixed-reserves.service';
import { CreateFixedReserveDto } from './dto/create-fixed-reserve.dto';
import { UpdateFixedReserveDto } from './dto/update-fixed-reserve.dto';
import { FixedReserve } from '@prisma/client';

@ApiTags('fixed-reserves')
@Controller('fixed-reserves')
export class FixedReservesController {
  constructor(private readonly fixedReservesService: FixedReservesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new fixed reserve' })
  @ApiResponse({
    status: 201,
    description: 'The fixed reserve has been successfully created.',
  })
  async create(
    @Body() createFixedReserveDto: CreateFixedReserveDto,
  ): Promise<FixedReserve> {
    return this.fixedReservesService.create(createFixedReserveDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fixed reserves' })
  @ApiResponse({
    status: 200,
    description: 'Return all fixed reserves.',
  })
  async findAll(): Promise<FixedReserve[]> {
    return this.fixedReservesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a fixed reserve by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the fixed reserve.',
  })
  @ApiResponse({ status: 404, description: 'Fixed reserve not found.' })
  async findOne(@Param('id') id: string): Promise<FixedReserve> {
    return this.fixedReservesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a fixed reserve' })
  @ApiResponse({
    status: 200,
    description: 'The fixed reserve has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Fixed reserve not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateFixedReserveDto: UpdateFixedReserveDto,
  ): Promise<FixedReserve> {
    return this.fixedReservesService.update(id, updateFixedReserveDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a fixed reserve' })
  @ApiResponse({
    status: 200,
    description: 'The fixed reserve has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Fixed reserve not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.fixedReservesService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle the status of a fixed reserve' })
  @ApiResponse({
    status: 200,
    description: 'The status of the fixed reserve has been toggled.',
  })
  @ApiResponse({ status: 404, description: 'Fixed reserve not found.' })
  async toggleStatus(@Param('id') id: string): Promise<FixedReserve> {
    return this.fixedReservesService.toggleStatus(id);
  }
}
