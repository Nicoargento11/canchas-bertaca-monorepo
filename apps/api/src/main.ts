import * as dotenv from 'dotenv';
import { resolve, join } from 'path';

// Cargar .env ANTES de cualquier otra cosa
const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'apps/api/.env'),
  join(__dirname, '../.env'),
  join(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) break;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { randomUUID } from 'crypto';

// Polyfill para navegadores o entornos limitados
if (typeof globalThis.crypto?.randomUUID !== 'function') {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => randomUUID(),
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  // Configuración mejorada de CORS

  const corsOptions = {
    origin: (origin, callback) => {
      // Lista de dominios permitidos
      const allowedOrigins = [
        'http://localhost:3000',
        'https://svgvr0cl-3000.brs.devtunnels.ms',
        'https://canchas-bertaca-monorepo-web.vercel.app',
        'https://reservasfutbol.com.ar',
        'https://www.reservasfutbol.com.ar',
        process.env.FRONT_END_URL,
      ].filter(Boolean); // Elimina valores undefined/null

      // Permitir solicitudes sin origen (como mobile apps o Postman)
      if (!origin) return callback(null, true);

      // Verificar si el origen está en la lista blanca
      if (
        allowedOrigins.some(
          (allowedOrigin) =>
            origin === allowedOrigin || origin.startsWith(allowedOrigin), // Para subdominios
        )
      ) {
        return callback(null, true);
      }

      // Rechazar solicitudes de orígenes no permitidos
      console.warn(`CORS bloqueado para origen: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'Set-Cookie',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  // Aplicar middlewares en el orden correcto
  app.use(cookieParser());
  app.use(compression());
  app.enableCors(corsOptions);

  // Resto de tu configuración...
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (err) =>
            `${err.property}: ${Object.values(err.constraints).join(', ')}`,
        );
        return new BadRequestException(messages);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('PartidosYa API')
    .setDescription('API para el sistema de reservas deportivas')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
