import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UsersService } from 'src/user/users.service';
import { hash, verify } from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import { ConfigType } from '@nestjs/config';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) throw new ConflictException('¡El usuario ya existe!');
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('EL usuario no ha sido encontrado');
    }
    const isPasswordMatched = await verify(user.password, password);
    if (!isPasswordMatched)
      throw new UnauthorizedException('Contraseña icorrecta');

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone || null,
    };
  }

  async login(
    userId: string,
    name: string,
    role: Role,
    email: string,
    phone: string | null,
  ) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRT = await hash(refreshToken);
    await this.userService.updatedHashedRefreshToken(userId, hashedRT);
    return {
      id: userId,
      name: name,
      role,
      email,
      phone,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    console.log(payload);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateJwtUser(userId) {
    const user = await this.userService.findById(userId);

    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const refreshTokenMatched = await verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatched)
      throw new UnauthorizedException('Token no valido');

    const currentUser = { id: user.id };
    return currentUser;
  }

  async refreshToken(userId: string, name: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRT = await hash(refreshToken);
    await this.userService.updatedHashedRefreshToken(userId, hashedRT);
    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async validateGoogleService(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.userService.create(googleUser);
  }

  async signOut(userId: string) {
    try {
      await this.userService.updatedHashedRefreshToken(userId, null);
      return { success: true };
    } catch (error) {
      console.error('Error during signOut:', error);
      return { error: 'Error al cerrar sesión' };
    }
  }
}
