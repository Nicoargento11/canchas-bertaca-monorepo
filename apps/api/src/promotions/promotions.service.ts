import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionType } from '@prisma/client';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Obtener todas las promociones de un complejo
   */
  async findAll(complexId?: string, onlyActive?: boolean) {
    const where: any = {};

    if (complexId) {
      where.complexId = complexId;
    }

    if (onlyActive) {
      where.isActive = true;
      // También verificar fechas de validez
      const now = new Date();
      where.OR = [
        { validFrom: null, validTo: null },
        { validFrom: { lte: now }, validTo: null },
        { validFrom: null, validTo: { gte: now } },
        { validFrom: { lte: now }, validTo: { gte: now } },
      ];
    }

    return this.prisma.promotion.findMany({
      where,
      include: {
        complex: { select: { id: true, name: true } },
        sportType: { select: { id: true, name: true } },
        court: { select: { id: true, name: true, courtNumber: true } },
        giftProduct: { select: { id: true, name: true, salePrice: true } },
        targetProduct: { select: { id: true, name: true, salePrice: true } },
        giftProducts: {
          include: {
            product: { select: { id: true, name: true, salePrice: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener una promoción por ID
   */
  async findById(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        complex: { select: { id: true, name: true } },
        sportType: { select: { id: true, name: true } },
        court: { select: { id: true, name: true, courtNumber: true } },
        giftProduct: { select: { id: true, name: true, salePrice: true } },
        targetProduct: { select: { id: true, name: true, salePrice: true } },
        giftProducts: {
          include: {
            product: { select: { id: true, name: true, salePrice: true } },
          },
        },
        _count: {
          select: {
            reserves: true,
            fixedReserves: true,
            productSales: true,
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promoción no encontrada');
    }

    return promotion;
  }

  /**
   * Buscar promoción por código de cupón
   */
  async findByCode(code: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { code },
      include: {
        complex: { select: { id: true, name: true } },
        sportType: { select: { id: true, name: true } },
        court: { select: { id: true, name: true, courtNumber: true } },
        giftProduct: { select: { id: true, name: true, salePrice: true } },
        targetProduct: { select: { id: true, name: true, salePrice: true } },
        giftProducts: {
          include: {
            product: { select: { id: true, name: true, salePrice: true } },
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Código de cupón no encontrado');
    }

    return promotion;
  }

  /**
   * Crear una nueva promoción
   */
  async create(createPromotionDto: CreatePromotionDto) {
    // Validar que el complejo existe
    const complex = await this.prisma.complex.findUnique({
      where: { id: createPromotionDto.complexId },
    });
    if (!complex) {
      throw new NotFoundException('Complejo no encontrado');
    }

    // Validar sportType si se proporciona
    if (createPromotionDto.sportTypeId) {
      const sportType = await this.prisma.sportType.findUnique({
        where: { id: createPromotionDto.sportTypeId },
      });
      if (!sportType) {
        throw new NotFoundException('Tipo de deporte no encontrado');
      }
    }

    // Validar court si se proporciona
    if (createPromotionDto.courtId) {
      const court = await this.prisma.court.findUnique({
        where: { id: createPromotionDto.courtId },
      });
      if (!court) {
        throw new NotFoundException('Cancha no encontrada');
      }
    }

    // Validar productos regalo si el tipo es GIFT_PRODUCT
    if (createPromotionDto.type === PromotionType.GIFT_PRODUCT) {
      const hasGiftProducts =
        createPromotionDto.giftProducts &&
        createPromotionDto.giftProducts.length > 0;
      const hasLegacyGiftProduct = !!createPromotionDto.giftProductId;

      if (!hasGiftProducts && !hasLegacyGiftProduct) {
        throw new BadRequestException(
          'Debe especificar al menos un producto para regalar cuando el tipo es GIFT_PRODUCT',
        );
      }

      // Validar que todos los productos del array existan
      if (hasGiftProducts) {
        const productIds = createPromotionDto.giftProducts.map(
          (gp) => gp.productId,
        );
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
        });
        if (products.length !== productIds.length) {
          throw new NotFoundException(
            'Uno o más productos a regalar no fueron encontrados',
          );
        }
      }

      // Validar legacy giftProductId
      if (hasLegacyGiftProduct && !hasGiftProducts) {
        const product = await this.prisma.product.findUnique({
          where: { id: createPromotionDto.giftProductId },
        });
        if (!product) {
          throw new NotFoundException('Producto a regalar no encontrado');
        }
      }
    }

    // Validar value para tipos de descuento
    if (
      createPromotionDto.type !== PromotionType.GIFT_PRODUCT &&
      (createPromotionDto.value === undefined ||
        createPromotionDto.value === null)
    ) {
      throw new BadRequestException(
        'Debe especificar un valor de descuento para este tipo de promoción',
      );
    }

    try {
      return await this.prisma.promotion.create({
        data: {
          name: createPromotionDto.name,
          description: createPromotionDto.description,
          code: createPromotionDto.code,
          isActive: createPromotionDto.isActive ?? true,
          validFrom: createPromotionDto.validFrom
            ? new Date(createPromotionDto.validFrom)
            : null,
          validTo: createPromotionDto.validTo
            ? new Date(createPromotionDto.validTo)
            : null,
          daysOfWeek: createPromotionDto.daysOfWeek ?? [],
          startTime: createPromotionDto.startTime,
          endTime: createPromotionDto.endTime,
          complexId: createPromotionDto.complexId,
          sportTypeId: createPromotionDto.sportTypeId,
          courtId: createPromotionDto.courtId,
          type: createPromotionDto.type,
          value: createPromotionDto.value,
          giftProductId: createPromotionDto.giftProductId,
          // Para promociones de producto
          targetProductId: createPromotionDto.targetProductId,
          buyQuantity: createPromotionDto.buyQuantity,
          payQuantity: createPromotionDto.payQuantity,
          // Crear relaciones con múltiples productos
          giftProducts: createPromotionDto.giftProducts?.length
            ? {
              create: createPromotionDto.giftProducts.map((gp) => ({
                productId: gp.productId,
                quantity: gp.quantity,
              })),
            }
            : undefined,
        },
        include: {
          complex: { select: { id: true, name: true } },
          sportType: { select: { id: true, name: true } },
          court: { select: { id: true, name: true, courtNumber: true } },
          giftProduct: { select: { id: true, name: true, salePrice: true } },
          giftProducts: {
            include: {
              product: { select: { id: true, name: true, salePrice: true } },
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('code')) {
          throw new ConflictException(
            'Ya existe una promoción con este código',
          );
        }
        throw new ConflictException('Error de duplicación en promoción');
      }
      throw error;
    }
  }

  /**
   * Actualizar una promoción
   */
  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    // Verificar que existe
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Promoción no encontrada');
    }

    // Validar relaciones si se actualizan
    if (updatePromotionDto.sportTypeId) {
      const sportType = await this.prisma.sportType.findUnique({
        where: { id: updatePromotionDto.sportTypeId },
      });
      if (!sportType) {
        throw new NotFoundException('Tipo de deporte no encontrado');
      }
    }

    if (updatePromotionDto.courtId) {
      const court = await this.prisma.court.findUnique({
        where: { id: updatePromotionDto.courtId },
      });
      if (!court) {
        throw new NotFoundException('Cancha no encontrada');
      }
    }

    if (updatePromotionDto.giftProductId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updatePromotionDto.giftProductId },
      });
      if (!product) {
        throw new NotFoundException('Producto a regalar no encontrado');
      }
    }

    // Validar giftProducts si se proporcionan
    if (
      updatePromotionDto.giftProducts &&
      updatePromotionDto.giftProducts.length > 0
    ) {
      const productIds = updatePromotionDto.giftProducts.map(
        (gp) => gp.productId,
      );
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      if (products.length !== productIds.length) {
        throw new NotFoundException(
          'Uno o más productos a regalar no fueron encontrados',
        );
      }
    }

    // Extraer giftProducts del DTO para manejarlo separadamente
    const { giftProducts, ...restDto } = updatePromotionDto;

    try {
      // Si hay giftProducts, sincronizar: borrar existentes y crear nuevos
      if (giftProducts !== undefined) {
        await this.prisma.promotionGiftProduct.deleteMany({
          where: { promotionId: id },
        });

        if (giftProducts.length > 0) {
          await this.prisma.promotionGiftProduct.createMany({
            data: giftProducts.map((gp) => ({
              promotionId: id,
              productId: gp.productId,
              quantity: gp.quantity,
            })),
          });
        }
      }

      return await this.prisma.promotion.update({
        where: { id },
        data: {
          ...restDto,
          validFrom: restDto.validFrom
            ? new Date(restDto.validFrom)
            : undefined,
          validTo: restDto.validTo ? new Date(restDto.validTo) : undefined,
        },
        include: {
          complex: { select: { id: true, name: true } },
          sportType: { select: { id: true, name: true } },
          court: { select: { id: true, name: true, courtNumber: true } },
          giftProduct: { select: { id: true, name: true, salePrice: true } },
          giftProducts: {
            include: {
              product: { select: { id: true, name: true, salePrice: true } },
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una promoción con este código');
      }
      throw error;
    }
  }

  /**
   * Eliminar una promoción (soft delete - desactivar)
   */
  async deactivate(id: string) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Promoción no encontrada');
    }

    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Eliminar una promoción permanentemente
   */
  async delete(id: string) {
    const existing = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reserves: true,
            fixedReserves: true,
            productSales: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Promoción no encontrada');
    }

    // Verificar si tiene registros asociados
    const totalUsage =
      existing._count.reserves +
      existing._count.fixedReserves +
      existing._count.productSales;

    if (totalUsage > 0) {
      throw new ConflictException(
        `No se puede eliminar la promoción porque tiene ${totalUsage} uso(s) registrado(s). Considere desactivarla en su lugar.`,
      );
    }

    await this.prisma.promotion.delete({ where: { id } });
  }

  /**
   * Validar si una promoción aplica para una reserva específica
   */
  async validatePromotion(
    promotionId: string,
    complexId: string,
    courtId: string,
    sportTypeId: string,
    date: Date,
    time: string, // formato "HH:mm"
  ): Promise<{ valid: boolean; reason?: string; promotion?: any }> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        giftProduct: true,
      },
    });

    if (!promotion) {
      return { valid: false, reason: 'Promoción no encontrada' };
    }

    // Verificar si está activa
    if (!promotion.isActive) {
      return { valid: false, reason: 'La promoción no está activa' };
    }

    // Verificar complejo
    if (promotion.complexId !== complexId) {
      return {
        valid: false,
        reason: 'La promoción no aplica para este complejo',
      };
    }

    // Verificar tipo de deporte
    if (promotion.sportTypeId && promotion.sportTypeId !== sportTypeId) {
      return {
        valid: false,
        reason: 'La promoción no aplica para este deporte',
      };
    }

    // Verificar cancha
    if (promotion.courtId && promotion.courtId !== courtId) {
      return {
        valid: false,
        reason: 'La promoción no aplica para esta cancha',
      };
    }

    // Verificar fechas de validez
    const now = new Date();
    if (promotion.validFrom && new Date(promotion.validFrom) > now) {
      return { valid: false, reason: 'La promoción aún no está vigente' };
    }
    if (promotion.validTo && new Date(promotion.validTo) < now) {
      return { valid: false, reason: 'La promoción ha expirado' };
    }

    // Verificar día de la semana
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    if (
      promotion.daysOfWeek.length > 0 &&
      !promotion.daysOfWeek.includes(dayOfWeek)
    ) {
      return {
        valid: false,
        reason: 'La promoción no aplica para este día de la semana',
      };
    }

    // Verificar horario
    if (promotion.startTime && promotion.endTime) {
      const [promoStartH, promoStartM] = promotion.startTime
        .split(':')
        .map(Number);
      const [promoEndH, promoEndM] = promotion.endTime.split(':').map(Number);
      const [reserveH, reserveM] = time.split(':').map(Number);

      const promoStart = promoStartH * 60 + promoStartM;
      const promoEnd = promoEndH * 60 + promoEndM;
      const reserveTime = reserveH * 60 + reserveM;

      if (reserveTime < promoStart || reserveTime >= promoEnd) {
        return {
          valid: false,
          reason: 'La promoción no aplica para este horario',
        };
      }
    }

    return { valid: true, promotion };
  }

  /**
   * Calcular el precio con descuento aplicado
   */
  calculateDiscountedPrice(
    originalPrice: number,
    promotion: { type: PromotionType; value?: number },
  ): number {
    switch (promotion.type) {
      case PromotionType.PERCENTAGE_DISCOUNT:
        return Math.round(originalPrice * (1 - (promotion.value || 0) / 100));

      case PromotionType.FIXED_AMOUNT_DISCOUNT:
        return Math.max(0, originalPrice - (promotion.value || 0));

      case PromotionType.FIXED_PRICE:
        return promotion.value || originalPrice;

      case PromotionType.GIFT_PRODUCT:
        return originalPrice; // El precio no cambia, se regala un producto

      default:
        return originalPrice;
    }
  }

  /**
   * Obtener estadísticas de uso de promociones
   */
  async getPromotionStats(promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        reserves: {
          select: { id: true, price: true, createdAt: true },
        },
        fixedReserves: {
          select: { id: true, createdAt: true },
        },
        productSales: {
          select: { id: true, price: true, quantity: true, createdAt: true },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promoción no encontrada');
    }

    return {
      id: promotion.id,
      name: promotion.name,
      totalReserves: promotion.reserves.length,
      totalFixedReserves: promotion.fixedReserves.length,
      totalProductSales: promotion.productSales.length,
      totalUsage:
        promotion.reserves.length +
        promotion.fixedReserves.length +
        promotion.productSales.length,
    };
  }
}
