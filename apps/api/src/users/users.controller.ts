import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  ForbiddenException,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';
// import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE
  @ApiOperation({ summary: 'Crear nuevo usuario (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiBody({ type: CreateUserDto })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
  @Post()
  async createUser(
    @CurrentUser() currentUser: UserEntity,
    @Body() createUserDto: CreateUserDto,
  ) {
    // Solo SUPER_ADMIN puede asignar roles de admin
    if (
      (createUserDto.role === Role.SUPER_ADMIN ||
        createUserDto.role === Role.ORGANIZACION_ADMIN) &&
      currentUser.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'No tienes permisos para crear usuarios con este rol',
      );
    }
    return this.usersService.create(createUserDto);
  }

  // READ
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
  @Get()
  async findAll(
    @CurrentUser() currentUser: UserEntity,
    @Query('search') search?: string,
  ) {
    // SUPER_ADMIN ve todos los usuarios
    if (currentUser.role === Role.SUPER_ADMIN) {
      return this.usersService.findAll({ search });
    }

    // ORGANIZACION_ADMIN ve usuarios de su organización
    if (currentUser.role === Role.ORGANIZACION_ADMIN) {
      return this.usersService.findAll({
        organizationId: currentUser.organizationId,
        search,
      });
    }

    // COMPLEJO_ADMIN ve usuarios de su complejo
    if (currentUser.role === Role.COMPLEJO_ADMIN) {
      return this.usersService.findAll({
        complexId: currentUser.complexId,
        search,
      });
    }

    return [];
  }

  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserEntity,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: UserEntity) {
    return user;
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);

    // ORGANIZACION_ADMIN solo puede ver usuarios de su organización

    return user;
  }

  // UPDATE
  @ApiOperation({ summary: 'Actualizar perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @CurrentUser() currentUser: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Eliminar campos que no pueden ser actualizados por el usuario
    delete updateUserDto.role;
    delete updateUserDto.organizationId;
    delete updateUserDto.complexId;

    return this.usersService.update(currentUser.id, updateUserDto);
  }

  @ApiOperation({ summary: 'Cambiar contraseña del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente',
    schema: {
      example: {
        message: 'Contraseña actualizada correctamente',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o nueva contraseña no cumple requisitos',
  })
  @ApiResponse({
    status: 401,
    description: 'Contraseña actual incorrecta o no autorizado',
  })
  @ApiBody({ type: ChangePasswordDto })
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(
    @CurrentUser() currentUser: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      currentUser.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return { message: 'Contraseña actualizada correctamente' };
  }

  @ApiOperation({ summary: 'Actualizar usuario (solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UserEntity,
  })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
  @Patch(':id')
  async updateUser(
    @CurrentUser() currentUser: UserEntity,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Solo SUPER_ADMIN puede cambiar roles
    if (updateUserDto.role && currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Solo SUPER_ADMIN puede cambiar roles');
    }

    // ORGANIZACION_ADMIN solo puede actualizar usuarios de su organización
    if (currentUser.role === Role.ORGANIZACION_ADMIN) {
      const userToUpdate = await this.usersService.findOne(id);
      if (userToUpdate.organizationId !== currentUser.organizationId) {
        throw new ForbiddenException(
          'No tienes permisos para actualizar este usuario',
        );
      }

      // No puede cambiar el rol
      if (updateUserDto.role) {
        throw new ForbiddenException('No tienes permisos para cambiar roles');
      }
    }

    return this.usersService.update(id, updateUserDto);
  }

  // DELETE
  @ApiOperation({ summary: 'Eliminar usuario (solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado',
    schema: {
      example: {
        message: 'Usuario eliminado correctamente',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'No tienes permisos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: UserEntity,
    @Param('id') id: string,
  ) {
    // No se puede eliminar a sí mismo
    if (currentUser.id === id) {
      throw new ForbiddenException('No puedes eliminarte a ti mismo');
    }

    // ORGANIZACION_ADMIN solo puede eliminar usuarios de su organización
    if (currentUser.role === Role.ORGANIZACION_ADMIN) {
      const userToDelete = await this.usersService.findOne(id);
      if (userToDelete.organizationId !== currentUser.organizationId) {
        throw new ForbiddenException(
          'No tienes permisos para eliminar este usuario',
        );
      }
    }

    await this.usersService.remove(id);
    return { message: 'Usuario eliminado correctamente' };
  }
}
