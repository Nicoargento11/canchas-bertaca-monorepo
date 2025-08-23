import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Complex, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // Registro de nuevos usuarios
  async register(registerDto: RegisterDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: UserEntity;
  }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ForbiddenException('Email already in use');
    }

    const user = await this.usersService.create({
      ...registerDto,
      role: 'USUARIO', // Rol por defecto
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: new UserEntity(user),
    };
  }

  // Validación de credenciales
  async validateUser(email: string, pass: string): Promise<UserEntity> {
    // 1. Verifica el usuario
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValid = await bcrypt.compare(pass, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  // Login tradicional
  async login(
    userId: string,
    name: string,
    role: Role,
    email: string,
    phone: string | null,
    Complex: Complex | null,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: UserEntity;
  }> {
    // const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.getTokens(userId, email, role);
    await this.updateRefreshToken(userId, tokens.refresh_token);

    return {
      ...tokens,
      user: new UserEntity({
        id: userId,
        name,
        role,
        email,
        phone,
        Complex,
      }),
    };
  }

  async validateGoogleService(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.usersService.create(googleUser);
  }

  // Logout
  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshToken(userId, null);
  }

  // Refresh de tokens
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      await this.usersService.setRefreshToken(userId, null);
      throw new ForbiddenException('Access Denied - Possible token reuse');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  // Validación de tokens
  async validateToken(
    token: string,
    isRefreshToken = false,
  ): Promise<UserEntity> {
    try {
      const secret = isRefreshToken
        ? this.config.get('JWT_REFRESH_SECRET')
        : this.config.get('JWT_SECRET');

      const payload = await this.jwtService.verifyAsync(token, { secret });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return new UserEntity(user);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Cambio de contraseña
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });

    await this.usersService.setRefreshToken(userId, null);
  }

  // Métodos privados
  private async updateRefreshToken(userId: string, refreshToken: string) {
    await this.usersService.setRefreshToken(userId, refreshToken);
  }

  private async getTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
