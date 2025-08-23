import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly SALT_ROUNDS = 10;

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ForbiddenException('El email ya está registrado');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || Role.USUARIO,
      },
    });

    return new UserEntity(user);
  }

  async findAll(filters?: {
    role?: Role;
    organizationId?: string;
  }): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: filters,
    });
    return users;
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        fixedSchedules: true,
        reserves: { include: { court: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return new UserEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        Complex: true,
        // Incluir relaciones necesarias para autenticación
      },
    });
    return user ? new UserEntity(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // Verificar si el usuario existe
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ForbiddenException(
          'El email ya está en uso por otro usuario',
        );
      }
    }

    // Hashear la nueva contraseña si se proporciona
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return new UserEntity(user);
  }

  async remove(id: string): Promise<UserEntity> {
    // Verificar si el usuario existe antes de eliminar
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Podrías añadir validaciones adicionales aquí, como:
    // - No permitir eliminar usuarios con relaciones importantes
    // - No permitir eliminar el último admin de una organización

    const deletedUser = await this.prisma.user.delete({ where: { id } });
    return new UserEntity(deletedUser);
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = refreshToken
      ? await bcrypt.hash(refreshToken, this.SALT_ROUNDS)
      : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashedToken },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Verificar que la nueva contraseña no sea igual a la anterior
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ForbiddenException(
        'La nueva contraseña no puede ser igual a la actual',
      );
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        hashedRefreshToken: null, // Invalida todos los refresh tokens
      },
    });
  }

  // Método adicional útil para validaciones
  async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }
}
