import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000', // Desarrollo
      'https://canchas-bertaca-monorepo-web-oxkg.vercel.app/', // Producción
      'https://www.tudominio.com', // Alternativa con www
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], // Permitir estos métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Ajusta si tienes otros headers
  });

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

  const options = new DocumentBuilder()
    .setTitle('Dimas F5')
    .setDescription('API F5 Reserves')
    .setVersion('1.0')
    .setBasePath('api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
