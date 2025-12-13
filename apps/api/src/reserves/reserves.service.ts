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
    const pendingReservations = await this.prisma.reserve.findMany({
      where: {
        status: 'PENDIENTE',
        expiresAt: { gt: new Date() },
      },
    });

    pendingReservations.forEach((reserve) => {
      const remainingTime = reserve.expiresAt.getTime() - Date.now();
      if (remainingTime > 0) {
        this.setReservationTimeout(reserve.id, remainingTime);
      } else {
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
    const where: any = {
      courtId: dto.courtId,
      date: dto.date instanceof Date ? dto.date : new Date(dto.date),
      schedule: dto.schedule,
      complexId: dto.complexId,
      status: { not: 'RECHAZADO' },
    };

    if (dto.id) {
      where.id = { not: dto.id };
    }

    const existing = await this.prisma.reserve.findFirst({ where });

    if (existing) {
      throw new UnprocessableEntityException(
        'Conflicto de reserva: fecha/horario no disponible',
      );
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
      },
    });
  }

  findBySchedule(
    date: string,
    schedule: string,
    complexId,
    sportTypeId?: string,
  ) {
    return this.prisma.reserve.findMany({
      where: {
        date: new Date(date),
        schedule,
        NOT: { status: 'RECHAZADO' },
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
      },
    });
  }

  findByDay(date: string, complexId: string, sportTypeId?: string) {
    return this.prisma.reserve.findMany({
      where: {
        date: new Date(date),
        NOT: { status: 'RECHAZADO' },
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
        NOT: { status: 'RECHAZADO' },
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
}
