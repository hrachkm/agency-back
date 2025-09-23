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
  let validatedUser: UserFormat;
  let authCookie: string;
  let refreshCookie: string;

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
    const clientPg = app.get('PG');
    if (clientPg && typeof clientPg.end === 'function') {
      await clientPg.end();
    }
    await app.close();
  });

  describe('Login and user flow', () => {
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
        role: 'user',
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('created', true);
      createdUser = res.body.user;
    }, 15000);

    it('POST /auth/login should return cookies with tokens', async () => {
      const credentials = {
        email: createdUser.email,
        password: 'e2epass123',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('email', credentials.email);

      const rawCookies = res.headers['set-cookie'];
      expect(rawCookies).toBeDefined();

      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
      const access = cookies.find(c => c.includes('access_token='));
      const refresh = cookies.find(c => c.includes('refresh_token='));

      expect(access).toBeDefined();
      expect(refresh).toBeDefined();

      authCookie = access.split(';')[0];
      refreshCookie = refresh.split(';')[0];
    }, 10000);

    it('GET /users should return list of users or 400 if empty', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', authCookie);

      expect([200, 400]).toContain(res.statusCode);
    });

    it('DELETE /users/:id should remove the user', async () => {

      console.log(createdUser.id);

      const res = await request(app.getHttpServer())
        .delete(`/users/${createdUser.id}`)
        .set('Cookie', authCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('removed', true);
    });
  });

  describe('Token validation and refresh flow', () => {
    it('POST /users should create a new user for validation', async () => {
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
    }, 10000);

    it('POST /auth/login should return cookies with tokens', async () => {
      const credentials = {
        email: validatedUser.email,
        password: 'validate123',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('email', credentials.email);

      const rawCookies = res.headers['set-cookie'];
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
      const access = cookies.find(c => c.includes('access_token='));
      const refresh = cookies.find(c => c.includes('refresh_token='));

      authCookie = access.split(';')[0];
      refreshCookie = refresh.split(';')[0];
    }, 10000);

    it('GET /auth/refresh should return new tokens', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', validatedUser.email);
      expect(res.body).not.toHaveProperty('password');

      const rawCookies = res.headers['set-cookie'];
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
      const newAccess = cookies.find(c => c.includes('access_token='));
      const newRefresh = cookies.find(c => c.includes('refresh_token='));

      expect(newAccess).toBeDefined();
      expect(newRefresh).toBeDefined();
    });

    it('GET /auth/refresh should fail with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', 'refresh_token=invalid-token');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Refresh token inválido');
    });


    it('DELETE /users/:id should remove the validated user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/users/${validatedUser.id}`).set('Cookie', authCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('removed', true);
    });
  });
});