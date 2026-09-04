import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:4200', 'http://localhost:4201'];
  app.enableCors({ origin: allowedOrigins });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
