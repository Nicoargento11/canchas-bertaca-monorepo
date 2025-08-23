import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Complex, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationParams } from './dto/pagination.dto';
import { CreateComplexDto } from './dto/create-complex.dto';

@Injectable()
export class ComplexService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateComplexDto): Promise<Complex> {
    try {
      const existing = await this.prisma.complex.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException('Un complejo con este slug ya existe');
      }

      // Verificar que la organización existe
      const organizationExists = await this.prisma.organization.findUnique({
        where: { id: data.organizationId },
      });

      if (!organizationExists) {
        throw new BadRequestException('La organización especificada no existe');
      }

      return await this.prisma.complex.create({
        data,
        include: {
          courts: true,
          Organization: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Violación de campo único');
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('Datos relacionados no encontrados');
        }
      }
      throw error;
    }
  }

  async count(where?: Prisma.ComplexWhereInput): Promise<number> {
    return this.prisma.complex.count({ where });
  }

  async findAll({
    page = 1,
    limit = 10,
    where,
  }: PaginationParams & { where?: Prisma.ComplexWhereInput }): Promise<{
    data: Complex[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (page < 1) throw new BadRequestException('La página debe ser mayor a 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('El límite debe estar entre 1 y 100');

    const [data, total] = await Promise.all([
      this.prisma.complex.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        include: {
          courts: true,
          Organization: true,
          _count: {
            select: {
              courts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.count(where),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
  async findOne(id: string): Promise<Complex> {
    const complex = await this.prisma.complex.findUnique({
      where: { id },
      include: {
        courts: {
          include: {
            sportType: true,
          },
        },
        Organization: true,
        rates: true,
        schedules: true,
      },
    });

    if (!complex) {
      throw new NotFoundException(`Complejo con ID ${id} no encontrado`);
    }

    return complex;
  }

  async findBySlug(slug: string): Promise<Complex> {
    const complex = await this.prisma.complex.findUnique({
      where: { slug },
      include: {
        Organization: true,
        courts: true,
        schedules: {
          include: {
            scheduleDay: true,
            court: { include: { sportType: true } },
            rates: true,
          },
        },

        scheduleDays: true,
        fixedReserves: {
          include: { rate: true, court: true, user: true, scheduleDay: true },
        },
        rates: true,
        unavailableDays: true,
        sportTypes: true,
        products: true,
        productSales: { include: { payment: true, product: true } },
        payments: { include: { productSales: { include: { product: true } } } },
        CashRegister: true,
      },
    });

    if (!complex) {
      throw new NotFoundException(`Complejo con slug ${slug} no encontrado`);
    }

    return complex;
  }

  async update(id: string, data: Prisma.ComplexUpdateInput): Promise<Complex> {
    try {
      return await this.prisma.complex.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Violación de campo único');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Complex> {
    try {
      // Verificar que no tenga canchas asociadas
      const courtsCount = await this.prisma.court.count({
        where: { complexId: id },
      });

      if (courtsCount > 0) {
        throw new ConflictException(
          'No se puede eliminar el complejo porque tiene canchas asociadas',
        );
      }

      return await this.prisma.complex.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Complejo no encontrado');
        }
      }
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Complex> {
    const complex = await this.prisma.complex.findUnique({
      where: { id },
    });

    return this.prisma.complex.update({
      where: { id },
      data: { isActive: !complex.isActive },
    });
  }
}
