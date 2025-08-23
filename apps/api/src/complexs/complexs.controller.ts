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
import { CreateComplexDto } from './dto/create-complex.dto';
import { UpdateComplexDto } from './dto/update-complex.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ComplexResponseDto } from './dto/complex-response.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PaginationParams } from './dto/pagination.dto';
import { ComplexService } from './complexs.service';

@ApiTags('Complexes')
@ApiBearerAuth()
@Controller('complexes')
export class ComplexController {
  constructor(private readonly complexService: ComplexService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo complejo' })
  @ApiResponse({
    status: 201,
    description: 'Complejo creado exitosamente',
    type: ComplexResponseDto,
  })
  async create(@Body() createComplexDto: CreateComplexDto) {
    const complex = await this.complexService.create(createComplexDto);
    return complex;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de complejos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de complejos',
    type: [ComplexResponseDto],
  })
  async findAll(@Query() { page = 1, limit = 10 }: PaginationParams) {
    const complexes = await this.complexService.findAll({ page, limit });
    return complexes;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un complejo por ID' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del complejo',
    type: ComplexResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const complex = await this.complexService.findOne(id);
    return complex;
  }

  @Get('slug/:slug') // /complex/slug/mi-complejo
  @ApiOperation({ summary: 'Obtener un complejo por slug' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del complejo',
    type: ComplexResponseDto,
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.complexService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({ summary: 'Actualizar un complejo' })
  @ApiResponse({
    status: 200,
    description: 'Complejo actualizado',
    type: ComplexResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateComplexDto: UpdateComplexDto,
  ) {
    const complex = await this.complexService.update(id, updateComplexDto);
    return complex;
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
  @ApiOperation({ summary: 'Eliminar un complejo' })
  @ApiResponse({
    status: 200,
    description: 'Complejo eliminado',
    type: ComplexResponseDto,
  })
  async remove(@Param('id') id: string) {
    const complex = await this.complexService.remove(id);
    return new ComplexResponseDto(complex);
  }

  @Patch(':id/toggle-status')
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({ summary: 'Activar/desactivar complejo' })
  @ApiResponse({
    status: 200,
    description: 'Estado del complejo actualizado',
    type: ComplexResponseDto,
  })
  async toggleStatus(@Param('id') id: string) {
    const complex = await this.complexService.toggleStatus(id);
    return new ComplexResponseDto(complex);
  }
}
