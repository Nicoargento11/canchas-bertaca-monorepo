import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProductsModule } from './product/products.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000', // Desarrollo
      'https://canchas-bertaca-monorepo-web.vercel.app', // Producción
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

  const config = new DocumentBuilder()
    .setTitle('API de Gestión de Canchas')
    .setDescription('API para manejar reservas, productos y pagos')
    .setVersion('1.0')
    .addTag('products')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [ProductsModule],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
