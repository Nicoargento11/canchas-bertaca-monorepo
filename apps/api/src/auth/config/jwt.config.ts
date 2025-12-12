import { registerAs } from '@nestjs/config';

export default registerAs(
  'jwt',
  (): {
    secret: string;
    refreshSecret: string;
    signOptions: {
      expiresIn: string;
    };
    cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
      domain?: string;
    };
  } => ({
    // Configuración para el access token
    secret: process.env.JWT_SECRET || 'secretKey', // Nunca dejar valor por defecto en producción
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',

    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m', // 15 minutos
    },

    // Opciones para cookies
    cookieOptions: {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' ||
        process.env.COOKIE_SECURE === 'true',
      sameSite:
        process.env.NODE_ENV === 'production' ||
        process.env.COOKIE_SECURE === 'true'
          ? 'none'
          : 'lax',
      // CRÍTICO: No especificar dominio para permitir cookies cross-site
      domain: undefined,
    },
  }),
);
