import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { UpdateReserveDto } from './dto/update-reserve.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/user/users.service';

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
    const reserve = await this.prisma.reserves.findUnique({
      where: { id: reserveId },
    });

    if (reserve?.status === 'PENDIENTE') {
      await this.prisma.reserves.update({
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
    const pendingReservations = await this.prisma.reserves.findMany({
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

  async create(createReserveDto: CreateReserveDto) {
    const user = await this.usersService.findById(createReserveDto.userId);
    if (!user) {
      throw new BadRequestException('No existe el usuario');
    }

    const userReserves = await this.findByUser(createReserveDto.userId);
    const pendingReserve = userReserves?.find(
      (reserve) => reserve.status === 'PENDIENTE',
    );
    if (pendingReserve) {
      throw new BadRequestException(
        'No puedes realizar reservas teniendo otras pendientes',
      );
    }

    const existingReservation = await this.prisma.reserves.findFirst({
      where: {
        date: new Date(createReserveDto.date),
        schedule: createReserveDto.schedule,
        court: createReserveDto.court,
        NOT: { status: 'RECHAZADO' },
      },
    });

    if (existingReservation)
      throw new BadRequestException(
        'Una reserva con la misma fecha, horario y cancha ya existe',
      );

    return this.prisma.reserves.create({
      data: { ...createReserveDto },
    });
  }

  async paginate(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.reserves.count();
    const reserves = await this.prisma.reserves.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        User: true,
      },
    });

    return { total, reserves };
  }

  findAll() {
    return this.prisma.reserves.findMany();
  }

  findById(id: string) {
    return this.prisma.reserves.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.reserves.findMany({ where: { userId } });
  }

  findBySchedule(date: string, schedule: string) {
    return this.prisma.reserves.findMany({
      where: { date: new Date(date), schedule, NOT: { status: 'RECHAZADO' } },
    });
  }

  findByDay(date: string) {
    return this.prisma.reserves.findMany({
      where: { date: new Date(date), NOT: { status: 'RECHAZADO' } },
      include: {
        User: true,
        Payment: true,
        consumitions: { include: { product: true } },
      },
    });
  }

  findByMonth(month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    return this.prisma.reserves.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        NOT: { status: 'RECHAZADO' },
      },
      select: { date: true },
    });
  }

  findPendingWithToken() {
    return this.prisma.reserves.findMany({
      where: {
        paymentToken: { not: null },
        status: 'PENDIENTE',
      },
      select: {
        id: true,
        paymentToken: true,
        userId: true,
        date: true,
        court: true,
        schedule: true,
      }, // Solo campos necesarios
      take: 100, // Límite máximo por ejecución
      orderBy: { createdAt: 'asc' }, // Las más antiguas primero
    });
  }

  async update(id: string, data: UpdateReserveDto) {
    console.log('data', data);
    const user = await this.usersService.findById(data.userId);

    if (!user) {
      throw new BadRequestException('No existe el usuario');
    }

    const userReserves = await this.findByUser(data.userId);
    const pendingReserve = userReserves?.find(
      (reserve) => reserve.status === 'PENDIENTE' && reserve.id !== id,
    );
    if (pendingReserve) {
      throw new BadRequestException(
        'No puede realizar reservas teniendo otras pendientes',
      );
    }

    const existingReservation = await this.prisma.reserves.findFirst({
      where: {
        date: new Date(data.date),
        schedule: data.schedule,
        court: data.court,
        NOT: [
          { status: 'RECHAZADO' },
          { id }, // Excluye la reserva actual de la verificación
        ],
      },
    });
    console.log(existingReservation);
    if (existingReservation)
      throw new BadRequestException(
        'Una reserva con la misma fecha, horario y cancha ya existe',
      );

    return this.prisma.reserves.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.reserves.delete({ where: { id } });
  }
}
