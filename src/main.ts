import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import helmet from 'helmet';

//TODO Implementar documentacion con swagger
import { AppModule } from './app.module';

import config from './config';

const { port, allowedOrigins, ssl } = config().server;

async function bootstrap() {

  //Configuración HTTPS opcional
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

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //👇 CORS configurado para permitir cookies seguras
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
