import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import helmet from 'helmet';

import { AppModule } from './app.module';

import config from './config';

const { port, environment, allowedOrigins, ssl } = config().server;

async function bootstrap() {

  //Configuración HTTPS
  const httpsOptions = ssl.enabled
    ? {
      key: fs.readFileSync(ssl.keyPath),
      cert: fs.readFileSync(ssl.certPath),
    }
    : undefined;

  const app = await NestFactory.create(AppModule, { httpsOptions });
  // Seguridad con Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Puedes personalizar esto si usas CSP
    })
  );

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  if ((environment === 'development') || (environment === 'staging')) {
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    const configSwagger = new DocumentBuilder()
      .setTitle('API Login Boilerplate')
      .setDescription('Documentación de la API para autenticación y gestión de usuarios')
      .setVersion('1.0')
      .build();
  
    const document = SwaggerModule.createDocument(app, configSwagger);
    SwaggerModule.setup('api/docs', app, document);
  }

  //CORS configurado para permitir cookies seguras
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],

  });
  const isRunning = await app.listen(port);

  isRunning ? console.info(`Server running in port ${port} with ${ssl.enabled ? 'HTTPS' : 'HTTP'}`) : console.error(`Error running server`);
}
bootstrap();
