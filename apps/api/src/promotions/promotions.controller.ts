import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionResponseDto } from './dto/promotion-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva promoción' })
  @ApiResponse({
    status: 201,
    description: 'Promoción creada exitosamente',
    type: PromotionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Complejo/Deporte/Cancha no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una promoción con ese código',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN, Role.COMMUNITY_MANAGER)
  async create(
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las promociones' })
  @ApiQuery({
    name: 'complexId',
    required: false,
    description: 'Filtrar por ID del complejo',
  })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Solo promociones activas y vigentes',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de promociones',
    type: [PromotionResponseDto],
  })
  async findAll(
    @Query('complexId') complexId?: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<PromotionResponseDto[]> {
    return this.promotionsService.findAll(complexId, onlyActive === 'true');
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Buscar promoción por código de cupón' })
  @ApiParam({ name: 'code', description: 'Código del cupón' })
  @ApiResponse({
    status: 200,
    description: 'Promoción encontrada',
    type: PromotionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Código no encontrado' })
  async findByCode(@Param('code') code: string): Promise<PromotionResponseDto> {
    return this.promotionsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una promoción por ID' })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({
    status: 200,
    description: 'Promoción encontrada',
    type: PromotionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  async findOne(@Param('id') id: string): Promise<PromotionResponseDto> {
    return this.promotionsService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de uso de una promoción' })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de la promoción',
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  async getStats(@Param('id') id: string) {
    return this.promotionsService.getPromotionStats(id);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar si una promoción aplica para una reserva' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación',
  })
  async validatePromotion(
    @Body()
    body: {
      promotionId: string;
      complexId: string;
      courtId: string;
      sportTypeId: string;
      date: string;
      time: string;
    },
  ) {
    return this.promotionsService.validatePromotion(
      body.promotionId,
      body.complexId,
      body.courtId,
      body.sportTypeId,
      new Date(body.date),
      body.time,
    );
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular precio con descuento aplicado' })
  @ApiResponse({
    status: 200,
    description: 'Precio calculado',
  })
  async calculatePrice(
    @Body()
    body: {
      originalPrice: number;
      promotionId: string;
    },
  ) {
    const promotion = await this.promotionsService.findById(body.promotionId);
    const discountedPrice = this.promotionsService.calculateDiscountedPrice(
      body.originalPrice,
      { type: promotion.type, value: promotion.value },
    );

    return {
      originalPrice: body.originalPrice,
      discountedPrice,
      discount: body.originalPrice - discountedPrice,
      promotionType: promotion.type,
      promotionName: promotion.name,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una promoción' })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({
    status: 200,
    description: 'Promoción actualizada',
    type: PromotionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una promoción con ese código',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN, Role.COMMUNITY_MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar una promoción (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({
    status: 200,
    description: 'Promoción desactivada',
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN, Role.COMMUNITY_MANAGER)
  async deactivate(@Param('id') id: string) {
    return this.promotionsService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una promoción permanentemente' })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ status: 204, description: 'Promoción eliminada' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiResponse({
    description: 'No se puede eliminar porque tiene usos registrados',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN, Role.COMMUNITY_MANAGER)
  async remove(@Param('id') id: string): Promise<void> {
    return this.promotionsService.delete(id);
  }
}
