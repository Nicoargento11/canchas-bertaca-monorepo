import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { UpdateReserveDto } from './dto/update-reserve.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReservesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  private timeouts = new Map<string, NodeJS.Timeout>();

  setReservationTimeout(reserveId: string, delay: number) {
    const timeout = setTimeout(async () => {
      await this.checkAndExpireReservation(reserveId);
      this.timeouts.delete(reserveId);
    }, delay);

    this.timeouts.set(reserveId, timeout);
  }

  async checkAndExpireReservation(reserveId: string) {
    const reserve = await this.prisma.reserve.findUnique({
      where: { id: reserveId },
    });

    if (reserve?.status === 'PENDIENTE') {
      await this.prisma.reserve.update({
        where: { id: reserveId },
        data: {
          status: 'RECHAZADO',
          paymentToken: null,
          paymentUrl: null,
        },
      });
      // Opcional: Notificar al usuario
    }
  }

  clearReservationTimeout(reserveId: string) {
    const timeout = this.timeouts.get(reserveId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(reserveId);
    }
  }

  async onModuleInit() {
    await this.reprogramPendingTimeouts();
  }

  private async reprogramPendingTimeouts() {
    // Obtener todas las reservas PENDIENTES (incluyendo expiradas)
    const pendingReservations = await this.prisma.reserve.findMany({
      where: {
        status: 'PENDIENTE',
      },
    });

    pendingReservations.forEach((reserve) => {
      // Si no tiene expiresAt, es una reserva manual (sin timeout)
      if (!reserve.expiresAt) {
        return;
      }

      const remainingTime = reserve.expiresAt.getTime() - Date.now();
      if (remainingTime > 0) {
        // Aún no expiró, reprogramar timeout
        this.setReservationTimeout(reserve.id, remainingTime);
      } else {
        // Ya expiró, marcar como rechazada inmediatamente
        this.checkAndExpireReservation(reserve.id);
      }
    });
  }

  // ----------------------------
  // MÉTODOS PRINCIPALES (Públicos)
  // ----------------------------

  async create(createReserveDto: CreateReserveDto) {
    await this.validateCreateReserve(createReserveDto);
    return this.createReservation(createReserveDto);
  }

  async paginate(page: number, limit: number, complexId?: string) {
    return this.paginateReserves(page, limit, complexId);
  }

  async update(id: string, data: UpdateReserveDto) {
    await this.validateUpdateReserve(id, data);
    return this.updateReservation(id, data);
  }

  // ----------------------------
  // MÉTODOS DE VALIDACIÓN (Privados)
  // ----------------------------

  private async validateCreateReserve(dto: CreateReserveDto) {
    await Promise.all([
      this.validateUser(dto.userId),
      this.validateUserHasNoPendingReserves(dto.userId),
      this.validateUnavailableDay(dto.date, dto.complexId, dto.courtId),
      this.validateReservationConflict(dto),
    ]);
  }

  private async validateUpdateReserve(id: string, dto: UpdateReserveDto) {
    if (dto.userId) {
      await this.validateUser(dto.userId);
      await this.validateUserHasNoPendingReserves(dto.userId, id);
    }

    if (dto.date || dto.schedule || dto.courtId || dto.complexId) {
      // Si se actualiza la fecha, validar que no sea un día inhabilitado
      if (dto.date) {
        // Necesitamos complexId y courtId. Si no vienen en el DTO, hay que buscarlos de la reserva actual.
        // Por simplicidad y rendimiento, asumimos que si cambia la fecha, el frontend envía el contexto necesario o validamos con lo que hay.
        // Para hacerlo bien, deberíamos buscar la reserva si faltan datos.
        let complexId = dto.complexId;
        let courtId = dto.courtId;

        if (!complexId || !courtId) {
          const currentReserve = await this.prisma.reserve.findUnique({
            where: { id },
          });
          if (currentReserve) {
            complexId = complexId || currentReserve.complexId;
            courtId = courtId || currentReserve.courtId;
          }
        }

        if (complexId && courtId) {
          await this.validateUnavailableDay(dto.date, complexId, courtId);
        }
      }

      await this.validateReservationConflict({
        ...dto,
        id, // Pasamos el ID para excluirlo de la validación
      } as UpdateReserveDto & { id: string });
    }
  }

  private async validateUnavailableDay(
    date: Date | string,
    complexId: string,
    courtId: string,
  ) {
    const targetDate = new Date(date);
    // Crear rango del día completo en UTC para asegurar coincidencia
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const unavailable = await this.prisma.unavailableDay.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        complexId,
        OR: [{ courtId: null }, { courtId: courtId }],
      },
    });

    if (unavailable) {
      throw new UnprocessableEntityException(
        `El día seleccionado no está disponible: ${unavailable.reason || 'Mantenimiento'}`,
      );
    }
  }

  private async validateUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  private async validateUserHasNoPendingReserves(
    userId: string,
    excludeId?: string,
  ) {
    // Get user to check role
    const user = await this.usersService.findOne(userId);

    // Skip validation for staff roles (admins, recepción)
    // Only USER role should be restricted from having multiple pending reserves
    const staffRoles = [
      'SUPER_ADMIN',
      'ORGANIZACION_ADMIN',
      'COMPLEJO_ADMIN',
      'RECEPCION',
    ];
    if (user && staffRoles.includes(user.role)) {
      return; // Staff can have pending reserves
    }

    const where: any = {
      userId,
      status: 'PENDIENTE',
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const pendingReserve = await this.prisma.reserve.findFirst({ where });

    if (pendingReserve) {
      throw new ConflictException('El usuario tiene reservas pendientes');
    }
  }

  private async validateReservationConflict(dto: {
    courtId: string;
    complexId: string;
    date: Date | string;
    schedule: string;
    id?: string;
  }) {
    const newTimes = this.parseScheduleToMinutes(dto.schedule);

    const where: any = {
      courtId: dto.courtId,
      date: dto.date instanceof Date ? dto.date : new Date(dto.date),
      // No filtramos por schedule exacto, buscamos todas las del día/cancha
      // schedule: dto.schedule,
      complexId: dto.complexId,
      status: { notIn: ['RECHAZADO', 'CANCELADO'] },
    };

    if (dto.id) {
      where.id = { not: dto.id };
    }

    const existingReserves = await this.prisma.reserve.findMany({
      where,
      select: { schedule: true, id: true },
    });

    // Validar conflictos de superposición horaria
    if (newTimes) {
      for (const reserve of existingReserves) {
        const existingTimes = this.parseScheduleToMinutes(reserve.schedule);
        if (existingTimes) {
          // Lógica de superposición: (StartA < EndB) y (EndA > StartB)
          if (
            newTimes.start < existingTimes.end &&
            newTimes.end > existingTimes.start
          ) {
            throw new UnprocessableEntityException(
              `Conflicto de reserva: Ya existe una reserva en el horario ${reserve.schedule} que se solapa con el solicitado.`,
            );
          }
        }
      }
    } else {
      // Si por alguna razón el formato no es parseable, hacemos fallback a búsqueda exacta (legacy behavior)
      const exactMatch = existingReserves.find(
        (r) => r.schedule === dto.schedule,
      );
      if (exactMatch) {
        throw new UnprocessableEntityException(
          'Conflicto de reserva: fecha/horario no disponible',
        );
      }
    }
  }

  private parseScheduleToMinutes(
    schedule: string,
  ): { start: number; end: number } | null {
    try {
      // Formato esperado: "HH:mm - HH:mm"
      const parts = schedule.split(' - ');
      if (parts.length !== 2) return null;

      const [startStr, endStr] = parts;
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);

      if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM))
        return null;

      const start = startH * 60 + startM;
      let end = endH * 60 + endM;

      // Si termina al día siguiente (ej: 23:00 - 01:00), sumamos 24h
      if (end <= start) {
        end += 24 * 60;
      }

      return { start, end };
    } catch {
      return null;
    }
  }

  // ----------------------------
  // MÉTODOS DE ACCESO A DATOS (Privados)
  // ----------------------------

  private async createReservation(dto: CreateReserveDto) {
    return this.prisma.reserve.create({
      data: dto,
      include: this.defaultInclude,
    });
  }

  private async paginateReserves(
    page: number,
    limit: number,
    complexId?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereClause = complexId ? { complexId } : {};

    const [total, reserves] = await Promise.all([
      this.prisma.reserve.count({ where: whereClause }),
      this.prisma.reserve.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.paginateInclude,
      }),
    ]);

    return { total, reserves };
  }

  private async updateReservation(id: string, data: UpdateReserveDto) {
    // Si se actualiza el monto de la seña, debemos actualizar o crear el pago correspondiente
    if (data.reservationAmount !== undefined) {
      const reserve = await this.prisma.reserve.findUnique({
        where: { id },
        include: { payment: true },
      });

      if (reserve) {
        // Buscar si ya existe un pago de tipo RESERVA (seña)
        const existingPayment = reserve.payment.find(
          (p) => p.transactionType === 'RESERVA' && p.isPartial === true,
        );

        if (existingPayment) {
          // Si existe, actualizamos el monto
          await this.prisma.payment.update({
            where: { id: existingPayment.id },
            data: { amount: data.reservationAmount },
          });
        } else if (data.reservationAmount > 0) {
          // Si no existe y el monto es mayor a 0, creamos uno nuevo
          // Asumimos EFECTIVO por defecto si no se especifica, o podríamos requerir más datos
          // Para edición rápida, asumimos EFECTIVO o mantenemos consistencia
          await this.prisma.payment.create({
            data: {
              amount: data.reservationAmount,
              method: 'EFECTIVO', // Default para correcciones manuales
              transactionType: 'RESERVA',
              isPartial: true,
              reserveId: id,
              complexId: reserve.complexId,
            },
          });
        }
      }
    }

    return this.prisma.reserve.update({
      where: { id },
      data: {
        ...data,
      },
      include: this.defaultInclude,
    });
  }

  // ----------------------------
  // MÉTODOS DE CONSULTA (Públicos)
  // ----------------------------

  private get defaultInclude() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          // Removed role to keep it strictly minimal if not needed, or add if critical. Keeping it safe:
          role: true,
          // EXCLUDED: password, hashedRefreshToken, etc.
        },
      },
      court: {
        select: {
          id: true,
          name: true,
          courtNumber: true,
          sportType: {
            select: {
              name: true,
            },
          },
        },
      },
      fixedReserve: true,
      promotion: {
        select: {
          id: true,
          name: true,
          type: true,
          value: true,
          giftProducts: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    };
  }

  private get paginateInclude() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      court: {
        select: {
          id: true,
          name: true,
          courtNumber: true,
        },
      },
      promotion: {
        select: {
          id: true,
          name: true,
          type: true,
          value: true,
        },
      },
    };
  }

  findAll(complexId, sportTypeId?: string) {
    return this.prisma.reserve.findMany({
      where: {
        complexId,
        court: sportTypeId ? { sportTypeId } : undefined,
      },
      include: this.defaultInclude,
    });
  }

  findById(id: string) {
    return this.prisma.reserve.findUnique({
      where: { id },
      include: {
        ...this.defaultInclude,
        complex: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        payment: { include: { CashSession: true } },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.reserve.findMany({
      where: { userId },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            courtNumber: true,
            sportType: { select: { name: true } },
          },
        },
        complex: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        promotion: {
          select: {
            id: true,
            name: true,
            type: true,
            value: true,
          },
        },
      },
    });
  }

  findBySchedule(
    date: string,
    schedule: string,
    complexId,
    sportTypeId?: string,
  ) {
    // NOTA: No filtramos por 'schedule' en la query de base de datos
    // para traer todas las reservas del día y permitir que el helper
    // detecte solapamientos con reservas de rango mayor (ej: Eventos de 2hs)
    return this.prisma.reserve.findMany({
      where: {
        date: new Date(date),
        // schedule, <-- Eliminado para permitir detección de overlap
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
        complexId,
        court: sportTypeId ? { sportTypeId } : undefined,
      },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            courtNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
          },
        },
        promotion: {
          select: {
            id: true,
            name: true,
            type: true,
            value: true,
          },
        },
      },
    });
  }

  findByDay(date: string, complexId: string, sportTypeId?: string) {
    return this.prisma.reserve.findMany({
      where: {
        date: new Date(date),
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
        complexId,
        court: sportTypeId ? { sportTypeId } : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        payment: { include: { CashSession: true } },
        court: {
          select: {
            id: true,
            name: true,
            courtNumber: true,
          },
        },
        promotion: {
          select: {
            id: true,
            name: true,
            type: true,
            value: true,
            giftProducts: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  findByMonth(
    month: number,
    year: number,
    complexId: string,
    sportTypeId?: string,
  ) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    return this.prisma.reserve.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: { notIn: ['RECHAZADO', 'CANCELADO'] },
        complexId,
        court: sportTypeId ? { sportTypeId } : undefined,
      },
      select: {
        date: true,
        price: true,
        status: true,
        court: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findHasPaymentToken() {
    return this.prisma.reserve.findMany({
      where: { NOT: { paymentToken: null } },
      include: {
        user: true,
      },
    });
  }

  async updateStatus(id: string, status: Status) {
    return this.prisma.reserve.update({
      where: { id },
      data: { status },
      include: {
        user: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.reserve.delete({
      where: { id },
      include: {
        user: true,
        court: true,
      },
    });
  }

  // Deduct stock for gift products in a promotion and create sale record
  async deductGiftProductStock(reserve: any) {
    // Check if the reserve has a promotion
    if (!reserve.promotionId) {
      return {
        success: false,
        message: 'No promotion associated with this reserve',
      };
    }

    // Get the promotion with gift products
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: reserve.promotionId },
      include: {
        giftProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (
      !promotion ||
      promotion.type !== 'GIFT_PRODUCT' ||
      !promotion.giftProducts.length
    ) {
      return { success: false, message: 'No gift products to deduct' };
    }

    // Create a Sale record for the gift products (total = 0 since they're free)
    const sale = await this.prisma.sale.create({
      data: {
        totalAmount: 0,
        complexId: reserve.complexId,
        createdById: reserve.userId,
      },
    });

    // Deduct stock and create ProductSale for each gift product
    const deductions = await Promise.all(
      promotion.giftProducts.map(async (gp) => {
        const product = await this.prisma.product.findUnique({
          where: { id: gp.productId },
        });

        if (!product) {
          return {
            productId: gp.productId,
            success: false,
            message: 'Product not found',
          };
        }

        const newStock = Math.max(0, product.stock - gp.quantity);

        // Update product stock
        await this.prisma.product.update({
          where: { id: gp.productId },
          data: { stock: newStock },
        });

        // Create ProductSale record for traceability
        await this.prisma.productSale.create({
          data: {
            productId: gp.productId,
            quantity: gp.quantity,
            price: 0, // Free because it's a gift
            isGift: true,
            reserveId: reserve.id,
            promotionId: promotion.id,
            saleId: sale.id,
            complexId: reserve.complexId,
          },
        });

        return {
          productId: gp.productId,
          productName: product.name,
          quantityDeducted: gp.quantity,
          newStock,
          success: true,
        };
      }),
    );

    return {
      success: true,
      message: 'Stock deducted and sale recorded successfully',
      saleId: sale.id,
      deductions,
    };
  }
}
