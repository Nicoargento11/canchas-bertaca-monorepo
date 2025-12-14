import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Inject,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request as RequestExpress, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/types/request.types';
import jwtConfig from './config/jwt.config';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private stateStorage = new Map<string, string>(); // Almacén temporal para states

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  @ApiBody({ type: RegisterDto })
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.register(registerDto);

    this.setAuthCookies(res, access_token, refresh_token);

    return {
      user: new UserEntity(user),
      access_token,
      refresh_token,
    };
  }

  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    headers: {
      'Set-Cookie': {
        description: 'Establece cookies HTTP-only con los tokens',
        schema: {
          type: 'string',
          example: 'access_token=abc123; HttpOnly; Path=/; Max-Age=900',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiBody({ type: LoginDto })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, user } = await this.authService.login(
      req.user.id,
      req.user.name,
      req.user.role,
      req.user.email,
      req.user.phone,
      req.user.Complex,
    );

    this.setAuthCookies(res, access_token, refresh_token);

    return {
      user: new UserEntity(user),
      access_token,
      refresh_token,
    };
  }

  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiBearerAuth() // Para JWT via Header
  @ApiCookieAuth('refresh_token')
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user['id']);
    this.clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {
    // El state se maneja en el callback
  }
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Res() res: Response) {
    // Capturar el state del query parameter del callback de Google
    const returnTo = req.query?.state || '/';
    const response = await this.authService.login(
      req.user.id,
      req.user.name,
      req.user.role,
      req.user.email,
      req.user.phone,
      req.user.Complex,
    );

    // ✅ SOLUCIÓN: Establecer cookies ANTES de redirigir
    this.setAuthCookies(res, response.access_token, response.refresh_token);

    // Redirige al frontend con el accessToken y la ruta original (state)
    const redirectUrl =
      `${process.env.FRONT_END_URL}/api/auth/google/callback?` +
      `accessToken=${response.access_token}` +
      `&refreshToken=${response.refresh_token}` +
      `&userId=${response.user.id}` +
      `&name=${response.user.name}` +
      `&role=${response.user.role}` +
      `&email=${response.user.email}` +
      `&phone=${response.user.phone || ''}` +
      `&complexId=${response.user.Complex?.id || ''}` +
      `&complexSlug=${response.user.Complex?.slug || ''}` +
      `&returnTo=${encodeURIComponent(returnTo)}`; // ¡Incluye la ruta original!

    res.redirect(redirectUrl);
  }

  @ApiOperation({
    summary: 'Refrescar tokens de acceso',
    description:
      'Obtén un nuevo access token y refresh token usando un refresh token válido (en cookies o header).',
  })
  @ApiResponse({ status: 200, description: 'Tokens refrescados exitosamente' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  @ApiBearerAuth() // Para JWT via Header
  @ApiCookieAuth('refresh_token')
  // @Public()
  // @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: RequestExpress,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractRefreshToken(req);
    console.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { sub } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(sub);
      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.authService.refreshTokens(
        user.id,
        refreshToken,
      );
      this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);

      // return tokens;
      return { message: 'Tokens refreshed successfully' };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('access_token', accessToken, {
      ...this.jwtConfiguration.cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hora (se refresca automático)
    });

    res.cookie('refresh_token', refreshToken, {
      ...this.jwtConfiguration.cookieOptions,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 días (1 año, como Netflix)
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  private extractRefreshToken(req: RequestExpress): string | null {
    // Extrae el token de cookies o del header Authorization
    return (
      req.cookies?.refresh_token ||
      req.get('Authorization')?.replace('Bearer ', '') ||
      null
    );
  }
}
