import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all API routes
  app.setGlobalPrefix('api/v1');

  // Global validation pipe — strip unknown properties, validate DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — allow Admin Panel and Web App origins
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://instantatoz.online',
      'https://admin.instantatoz.online',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Instantatoz Backend running on port ${port}`);
}
bootstrap();
