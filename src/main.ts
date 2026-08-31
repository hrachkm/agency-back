import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import helmet from 'helmet';

import { doubleCsrfProtection } from './csrf.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {/* httpsOptions*/ });
  const configService = app.get(ConfigService);
  const serverConfig = configService.get('config')?.server ?? {
    port: 3100,
    environment: 'development',
    allowedOrigins: [],
  };
  const { port, environment, allowedOrigins } = serverConfig;

  //Configuración HTTPS
  /*const httpsOptions = ssl.enabled
    ? {
      key: fs.readFileSync(ssl.keyPath),
      cert: fs.readFileSync(ssl.certPath),
    }
    : undefined;*/

  // Seguridad con Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Puedes personalizar esto si usas CSP
    })
  );

  app.use(cookieParser());
  //app.use(doubleCsrfProtection);

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
      .setTitle('API Agencia inmuebles')
      .setDescription('Documentación de la API para autenticación y gestión de usuarios e inmuebles')
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-token'],
  });
  const isRunning = await app.listen(port);

  isRunning ? console.info(`Server running in port ${port} with HTTP`) : console.error(`Error running server`);
}
bootstrap();
