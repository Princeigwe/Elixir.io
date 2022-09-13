import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from '@nestjs/common'
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //removes unnecessary properties in POST request body
      transform: true
    })
  )
  app.setGlobalPrefix('/api/v1/')
  await app.listen(3000);
}
bootstrap();
