import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationParams } from './dto/pagination.dto';
import { CreateComplexDto } from './dto/create-complex.dto';
import { Complex, Prisma } from '@prisma/client';
import { MercadoPagoConfig, OAuth } from 'mercadopago';

@Injectable()
export class ComplexService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateComplexDto): Promise<Complex> {
    try {
      // Generar slug automáticamente si no se proporciona
      const slug = data.slug || this.generateSlug(data.name);

      const existing = await this.prisma.complex.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new ConflictException('Un complejo con este slug ya existe');
      }

      // Verificar que la organización existe
      if (data.organizationId) {
        const organizationExists = await this.prisma.organization.findUnique({
          where: { id: data.organizationId },
        });

        if (!organizationExists) {
          throw new BadRequestException(
            'La organización especificada no existe',
          );
        }
      }

      const complex = await this.prisma.complex.create({
        data: {
          ...data,
          slug,
        },
        include: {
          courts: true,
          Organization: true,
        },
      });

      // Crear los 7 días de la semana para el complejo
      const days = [0, 1, 2, 3, 4, 5, 6]; // 0 = Domingo, 1 = Lunes, ...

      await Promise.all(
        days.map((day) =>
          this.prisma.scheduleDay.create({
            data: {
              dayOfWeek: day,
              isActive: true,
              complexId: complex.id,
            },
          }),
        ),
      );

      return complex;
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
          managers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
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
        productSales: {
          include: {
            sale: { include: { payments: true } },
            product: true,
          },
        },
        payments: {
          include: {
            sale: {
              include: {
                productSales: { include: { product: true } },
              },
            },
            reserve: {
              include: {
                user: true,
                court: true,
              },
            },
          },
        },
        CashRegister: true,
        promotions: {
          include: {
            sportType: { select: { id: true, name: true } },
            court: { select: { id: true, name: true, courtNumber: true } },
            giftProduct: { select: { id: true, name: true, salePrice: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!complex) {
      throw new NotFoundException(`Complejo con slug ${slug} no encontrado`);
    }

    return complex;
  }

  async update(id: string, data: Prisma.ComplexUpdateInput): Promise<Complex> {
    try {
      // Verificar que el complejo existe
      const existingComplex = await this.prisma.complex.findUnique({
        where: { id },
      });

      if (!existingComplex) {
        throw new NotFoundException(`Complejo con ID ${id} no encontrado`);
      }

      // Validar slug único solo si se está actualizando
      if (data.slug && data.slug !== existingComplex.slug) {
        const slugExists = await this.prisma.complex.findFirst({
          where: {
            slug: data.slug as string,
            id: { not: id }, // Excluir el complejo actual
          },
        });

        if (slugExists) {
          throw new ConflictException('Ya existe un complejo con ese slug');
        }
      }

      // Email ya no requiere validación de unicidad - múltiples complejos pueden compartir email

      // Actualizar el complejo
      return await this.prisma.complex.update({
        where: { id },
        data,
        include: {
          courts: true,
          Organization: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Obtener el campo que causó el conflicto
          const field =
            (error.meta?.target as string[])?.join(', ') || 'campo único';
          throw new ConflictException(`Ya existe un complejo con ese ${field}`);
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Complejo no encontrado');
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

  /**
   * Canjear código OAuth de MercadoPago y guardar credenciales
   */
  async exchangeOAuthCode(
    complexId: string,
    code: string,
    redirectUri: string,
  ) {
    // Verificar que el complejo existe
    const complex = await this.prisma.complex.findUnique({
      where: { id: complexId },
    });

    if (!complex) {
      throw new NotFoundException('Complejo no encontrado');
    }

    // Configurar cliente OAuth con las credenciales de plataforma
    const platformClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    try {
      // Canjear el código por las credenciales
      const oauth = new OAuth(platformClient);
      const credentials = await oauth.create({
        body: {
          client_secret: process.env.MP_CLIENT_SECRET,
          client_id: process.env.MP_CLIENT_ID,
          code: code,
          redirect_uri: redirectUri,
        },
      });

      // Guardar las credenciales
      return await this.saveMercadoPagoConfig(complexId, {
        accessToken: credentials.access_token || '',
        refreshToken: credentials.refresh_token || '',
        publicKey: credentials.public_key || '',
        clientId: process.env.MP_CLIENT_ID,
        clientSecret: process.env.MP_CLIENT_SECRET,
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al canjear código OAuth: ' + error.message,
      );
    }
  }

  /**
   * Guardar o actualizar configuración de MercadoPago para un complejo
   */
  async saveMercadoPagoConfig(
    complexId: string,
    config: {
      accessToken: string;
      refreshToken?: string;
      publicKey: string;
      clientId?: string;
      clientSecret?: string;
    },
  ) {
    const complex = await this.prisma.complex.findUnique({
      where: { id: complexId },
    });

    if (!complex) {
      throw new NotFoundException('Complejo no encontrado');
    }

    // Buscar si ya existe una configuración
    const existingConfig = await this.prisma.paymentConfig.findUnique({
      where: { complexId },
    });

    if (existingConfig) {
      // Actualizar configuración existente
      return await this.prisma.paymentConfig.update({
        where: { complexId },
        data: {
          accessToken: config.accessToken,
          refreshToken: config.refreshToken,
          publicKey: config.publicKey,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          isActive: true,
        },
      });
    } else {
      // Crear nueva configuración
      return await this.prisma.paymentConfig.create({
        data: {
          complexId,
          accessToken: config.accessToken,
          refreshToken: config.refreshToken,
          publicKey: config.publicKey,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          isActive: true,
        },
      });
    }
  }

  /**
   * Obtener configuración de MercadoPago de un complejo
   */
  async getMercadoPagoConfig(complexId: string) {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { complexId },
      select: {
        id: true,
        publicKey: true,
        clientId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // NO devolvemos el accessToken ni clientSecret por seguridad
      },
    });

    if (!config) {
      throw new NotFoundException(
        'No se encontró configuración de MercadoPago para este complejo',
      );
    }

    return config;
  }

  /**
   * Obtener solo la Public Key de MercadoPago (endpoint público)
   */
  async getMercadoPagoPublicKey(complexId: string) {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { complexId },
      select: {
        publicKey: true,
        isActive: true,
      },
    });

    if (!config || !config.isActive) {
      throw new NotFoundException(
        'No se encontró configuración activa de MercadoPago para este complejo',
      );
    }

    return { publicKey: config.publicKey };
  }

  /**
   * Verificar si un complejo tiene configuración de MercadoPago activa
   */
  async hasMercadoPagoConfig(complexId: string): Promise<boolean> {
    const config = await this.prisma.paymentConfig.findFirst({
      where: {
        complexId,
        isActive: true,
      },
    });

    return !!config && !!config.accessToken;
  }

  /**
   * Desactivar configuración de MercadoPago
   */
  async deactivateMercadoPagoConfig(complexId: string) {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { complexId },
    });

    if (!config) {
      throw new NotFoundException(
        'No se encontró configuración de MercadoPago',
      );
    }

    // Eliminar físicamente la configuración para seguridad total
    return await this.prisma.paymentConfig.delete({
      where: { complexId },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-'); // Eliminar guiones múltiples
  }
}
