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
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { QueryCourtDto } from './dto/query-court.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CourtResponseDto } from './dto/court-response.dto';

@ApiTags('Courts - Canchas Deportivas')
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cancha' })
  @ApiResponse({
    status: 201,
    description: 'Cancha creada',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createCourtDto: CreateCourtDto) {
    return this.courtsService.create(createCourtDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las canchas' })
  @ApiQuery({
    name: 'complexId',
    required: false,
    description: 'Filtrar por complejo',
  })
  @ApiQuery({
    name: 'sportTypeId',
    required: false,
    description: 'Filtrar por tipo de deporte',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filtrar por estado activo/inactivo',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre o descripción',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de canchas',
    type: [CourtResponseDto],
  })
  findAll(@Query() query: QueryCourtDto) {
    return this.courtsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cancha por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cancha' })
  @ApiResponse({
    status: 200,
    description: 'Cancha encontrada',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cancha no encontrada' })
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cancha' })
  @ApiParam({ name: 'id', description: 'ID de la cancha' })
  @ApiResponse({
    status: 200,
    description: 'Cancha actualizada',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cancha no encontrada' })
  update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto) {
    return this.courtsService.update(id, updateCourtDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Cambiar estado de la cancha (activo/inactivo)' })
  @ApiParam({ name: 'id', description: 'ID de la cancha' })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cancha no encontrada' })
  toggleStatus(@Param('id') id: string) {
    return this.courtsService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una cancha' })
  @ApiParam({ name: 'id', description: 'ID de la cancha' })
  @ApiResponse({ status: 200, description: 'Cancha eliminada' })
  @ApiResponse({ status: 404, description: 'Cancha no encontrada' })
  remove(@Param('id') id: string) {
    return this.courtsService.remove(id);
  }
}
