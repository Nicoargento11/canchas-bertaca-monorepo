import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';
import { RateResponseDto } from './dto/rate-response.dto';
import { RateService } from './rates.service';

@ApiTags('rates')
@Controller('rates')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tarifas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarifas',
    type: [RateResponseDto],
  })
  async findAll(): Promise<RateResponseDto[]> {
    return this.rateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarifa por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarifa' })
  @ApiResponse({
    status: 200,
    description: 'Tarifa encontrada',
    type: RateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  async findOne(@Param('id') id: string): Promise<RateResponseDto> {
    return this.rateService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarifa' })
  @ApiResponse({
    status: 201,
    description: 'Tarifa creada exitosamente',
    type: RateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Conflicto con los datos' })
  async create(@Body() createRateDto: CreateRateDto): Promise<RateResponseDto> {
    return this.rateService.create(createRateDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una tarifa existente' })
  @ApiParam({ name: 'id', description: 'ID de la tarifa' })
  @ApiResponse({
    status: 200,
    description: 'Tarifa actualizada',
    type: RateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateRateDto: UpdateRateDto,
  ): Promise<RateResponseDto> {
    return this.rateService.update(id, updateRateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarifa' })
  @ApiParam({ name: 'id', description: 'ID de la tarifa' })
  @ApiResponse({ status: 204, description: 'Tarifa eliminada' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.rateService.delete(id);
  }
}
