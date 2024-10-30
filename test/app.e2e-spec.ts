import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Organization Project (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Auth', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);
    });

    it('should login and return JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      authToken = response.body.access_token;
      expect(authToken).toBeDefined();
    });
  });

  describe('Organizations', () => {
    it('should create an organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/organization')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Organization',
          description: 'Test Description',
        })
        .expect(201);

      organizationId = response.body.organization_id;
      expect(organizationId).toBeDefined();
    });

    it('should get all organizations', () => {
      return request(app.getHttpServer())
        .get('/organization')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should get organization by id', () => {
      return request(app.getHttpServer())
        .get(`/organization/${organizationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Test Organization');
        });
    });

    it('should update organization', () => {
      return request(app.getHttpServer())
        .put(`/organization/${organizationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Organization',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Organization');
        });
    });

    it('should invite user to organization', () => {
      return request(app.getHttpServer())
        .post(`/organization/${organizationId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_email: 'invited@example.com',
        })
        .expect(201);
    });

    it('should accept invitation', () => {
      return request(app.getHttpServer())
        .get('/organization/accept-invite')
        .query({ token: 'test-invitation-token' })
        .expect(200);
    });

    it('should delete organization', () => {
      return request(app.getHttpServer())
        .delete(`/organization/${organizationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
