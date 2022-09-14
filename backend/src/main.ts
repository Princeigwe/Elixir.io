import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from '@nestjs/common'
import * as cookieParser from 'cookie-parser';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle("Elixir.io")
    .setDescription("A health tech API for Elixir.io")
    .setVersion('1.0')
    .build()
  
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document) // 'api' is the endpoint to the Swagger doc


  await app.listen(3000);
}
bootstrap();
