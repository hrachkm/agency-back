import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('App E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    // Cerrar el cliente de PG
    const clientPg = app.get('PG');
    if (clientPg && typeof clientPg.end === 'function') {
      await clientPg.end();
    }

    await app.close();
  });

  it('GET / should return Server online!!', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Server online!!');
  });

  it('GET /database should return connection message', () => {
    return request(app.getHttpServer())
      .get('/database')
      .expect(200)
      .expect('Conexión a la base de datos exitosa. ✅');
  });

  it('GET /users should return list of users or 400 if empty', async () => {
    const res = await request(app.getHttpServer()).get('/users');
    expect([200, 400]).toContain(res.statusCode);
  });

  it('POST /users should create a new user', async () => {
    const newUser = {
      email: `e2euser-${Date.now()}@example.com`,
      password: 'e2epass123',
      role: 'user'
    };

    const res = await request(app.getHttpServer())
      .post('/users')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('created', true);
    expect(res.body.user).toHaveProperty('email', newUser.email);
  }, 20000);


  it('POST /auth/login should return JWT token', async () => {
    const credentials = {
      email: 'e2euser@example.com',
      password: 'e2epass123',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', credentials.email);
  }, 10000);
});