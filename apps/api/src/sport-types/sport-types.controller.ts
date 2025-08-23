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
import { SportTypesService } from './sport-types.service';
import { CreateSportTypeDto } from './dto/create-sport-type.dto';
import { UpdateSportTypeDto } from './dto/update-sport-type.dto';
import { QuerySportTypeDto } from './dto/query-sport-type.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { SportTypeResponseDto } from './dto/sport-type-response.dto';

@ApiTags('Sport Types - Tipos de Deporte')
@Controller('sport-types')
export class SportTypesController {
  constructor(private readonly sportTypesService: SportTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de deporte' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de deporte creado',
    type: SportTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El nombre ya existe' })
  create(@Body() createSportTypeDto: CreateSportTypeDto) {
    return this.sportTypesService.create(createSportTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de deporte' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de deporte',
    type: [SportTypeResponseDto],
  })
  findAll(@Query() query: QuerySportTypeDto) {
    return this.sportTypesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de deporte por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de deporte' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de deporte encontrado',
    type: SportTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de deporte no encontrado' })
  findOne(@Param('id') id: string) {
    return this.sportTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de deporte' })
  @ApiParam({ name: 'id', description: 'ID del tipo de deporte' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de deporte actualizado',
    type: SportTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de deporte no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateSportTypeDto: UpdateSportTypeDto,
  ) {
    return this.sportTypesService.update(id, updateSportTypeDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'Cambiar estado del tipo de deporte (activo/inactivo)',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de deporte' })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado',
    type: SportTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tipo de deporte no encontrado' })
  toggleStatus(@Param('id') id: string) {
    return this.sportTypesService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de deporte' })
  @ApiParam({ name: 'id', description: 'ID del tipo de deporte' })
  @ApiResponse({ status: 200, description: 'Tipo de deporte eliminado' })
  @ApiResponse({ status: 404, description: 'Tipo de deporte no encontrado' })
  remove(@Param('id') id: string) {
    return this.sportTypesService.remove(id);
  }
}
