import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';

interface UserFormat {
  id: number;
  email: string;
  password?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

describe('App E2E', () => {
  let app: INestApplication;
  let createdUser: UserFormat;
  let authCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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

  describe('should login success and then remove the user', () => {

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

      // Guardamos el ID para eliminarlo después
      createdUser = res.body.user;
      expect(createdUser.email).toBe(newUser.email);

    }, 20000);

    it('POST /auth/login should return cookie with token', async () => {
      const credentials = {
        email: createdUser.email,
        password: 'e2epass123',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('email', credentials.email);

      // Captura la cookie
      const rawCookie = res.headers['set-cookie'];
      expect(rawCookie).toBeDefined();
      authCookie = rawCookie[0].split(';')[0]; // auth_token=...
    }, 10000);

    it('GET /users should return list of users or 400 if empty', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', authCookie);

      expect([200, 400]).toContain(res.statusCode);
    });

    it('DELETE /users/:id should remove the user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/users/${createdUser.id}`)
        .set('Cookie', authCookie);


      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('removed', true);
    }, 10000);

    it('DELETE /users/:id should fail for non-existent user', async () => {
      const nonExistentUserId = 999999;

      const res = await request(app.getHttpServer())
        .delete(`/users/${nonExistentUserId}`)
        .set('Cookie', authCookie);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', `No se encontró el usuario con id ${nonExistentUserId}`);
    });

    it('DELETE /users/:id should fail with invalid id format', async () => {
      const res = await request(app.getHttpServer())
        .delete('/users/not-a-number')
        .set('Cookie', authCookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });
  })

  describe('should validate token after login and handle failure', () => {
    let validatedUser: UserFormat;

    it('POST /users should create a new user for token validation', async () => {
      const newUser = {
        email: `validateuser-${Date.now()}@example.com`,
        password: 'validate123',
        role: 'user',
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      validatedUser = res.body.user;
      expect(validatedUser.email).toBe(newUser.email);
    }, 10000);

    it('POST /auth/login should return cookie with token', async () => {
      const credentials = {
        email: validatedUser.email,
        password: 'validate123',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('email', credentials.email);

      // Captura la cookie
      const rawCookie = res.headers['set-cookie'];
      expect(rawCookie).toBeDefined();
      authCookie = rawCookie[0].split(';')[0]; // auth_token=...
    }, 10000);

    it('GET /auth/validate should return validated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/validate')
        .set('Cookie', authCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', validatedUser.email);
      expect(res.body).not.toHaveProperty('password');
    }, 10000);

    it('GET /auth/validate should fail with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/validate')
        .set('Cookie', 'invalid.token.here');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);

    it('DELETE /users/:id should remove the validated user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/users/${validatedUser.id}`)
        .set('Cookie', authCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('removed', true);
    }, 10000);
  });
});