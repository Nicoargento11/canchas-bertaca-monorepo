import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { UpdateReserveDto } from './dto/update-reserve.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class ReservesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

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
        'No puede realizar reservas teniendo otras pendientes',
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
      data: createReserveDto,
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

  findHasPaymentToken() {
    return this.prisma.reserves.findMany({
      where: { NOT: { paymentToken: null } },
    });
  }

  async update(id: string, data: UpdateReserveDto) {
    const user = await this.usersService.findById(data.userId);

    if (!user) {
      throw new BadRequestException('No existe el usuario');
    }

    const userReserves = await this.findByUser(data.userId);
    const pendingReserve = userReserves?.find(
      (reserve) => reserve.status === 'PENDIENTE',
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
        NOT: { status: 'RECHAZADO' },
      },
    });

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
