import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CreateComplexDto } from './dto/create-complex.dto';
import { UpdateComplexDto } from './dto/update-complex.dto';
import { SaveMercadoPagoConfigDto } from './dto/save-mercadopago-config.dto';
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener lista de complejos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de complejos',
    type: [ComplexResponseDto],
  })
  async findAll(@Query() { page = 1, limit = 100 }: PaginationParams) {
    const complexes = await this.complexService.findAll({ page, limit });
    return complexes.data; // Devolver solo el array para el frontend
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

  // ==================== ENDPOINTS DE MERCADOPAGO ====================

  @Post(':id/mercadopago/oauth')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({ summary: 'Canjear código OAuth de MercadoPago' })
  @ApiResponse({
    status: 200,
    description: 'Código OAuth canjeado y configuración guardada exitosamente',
  })
  async exchangeOAuthCode(
    @Param('id') complexId: string,
    @Body() body: { code: string; redirectUri: string },
  ) {
    return await this.complexService.exchangeOAuthCode(
      complexId,
      body.code,
      body.redirectUri,
    );
  }

  @Post(':id/mercadopago')
  // TODO: Descomentar cuando funcione el OAuth
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({ summary: 'Guardar configuración de MercadoPago' })
  @ApiResponse({
    status: 200,
    description: 'Configuración de MercadoPago guardada exitosamente',
  })
  async saveMercadoPagoConfig(
    @Param('id') complexId: string,
    @Body() config: SaveMercadoPagoConfigDto,
  ) {
    return await this.complexService.saveMercadoPagoConfig(complexId, config);
  }

  @Get(':id/mercadopago')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({ summary: 'Obtener configuración de MercadoPago' })
  @ApiResponse({
    status: 200,
    description: 'Configuración de MercadoPago',
  })
  async getMercadoPagoConfig(@Param('id') complexId: string) {
    return await this.complexService.getMercadoPagoConfig(complexId);
  }

  @Get(':id/mercadopago/status')
  @ApiOperation({ summary: 'Verificar si tiene MercadoPago configurado' })
  @ApiResponse({
    status: 200,
    description: 'Estado de configuración de MercadoPago',
  })
  async checkMercadoPagoStatus(@Param('id') complexId: string) {
    const hasConfig = await this.complexService.hasMercadoPagoConfig(complexId);
    return { hasConfig };
  }

  @Delete(':id/mercadopago')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @ApiOperation({ summary: 'Desactivar configuración de MercadoPago' })
  @ApiResponse({
    status: 200,
    description: 'Configuración desactivada',
  })
  async deactivateMercadoPagoConfig(@Param('id') complexId: string) {
    return await this.complexService.deactivateMercadoPagoConfig(complexId);
  }
}
