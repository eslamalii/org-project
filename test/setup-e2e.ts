import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import IORedisMock from 'ioredis-mock';
import { RedisService } from '../src/redis/redis.service'; // Ensure correct import
import { MongoClient } from 'mongodb';

// Mocking MailService to prevent sending real emails during tests
jest.mock('../src/mail/mail.service.ts', () => ({
  MailService: jest.fn().mockImplementation(() => ({
    sendInvitation: jest.fn(),
    sendNewUserPassword: jest.fn(),
  })),
}));

// Create a mock RedisService
const mockRedisService = {
  getClient: jest.fn().mockReturnValue(new IORedisMock()),
  getOrThrow: jest.fn(),
  getOrNil: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
};

let app: INestApplication;
let mongoServer: MongoMemoryServer;
let con: MongoClient;

beforeAll(async () => {
  // Start an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  con = await MongoClient.connect(mongoServer.getUri(), {});

  // Set necessary environment variables for testing
  // process.env.MONGO_URI = mongoUri;
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';
  // Add other environment variables as needed

  // Create a TestingModule with AppModule
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    // Override ConfigService to provide test-specific configurations
    .overrideProvider(ConfigService)
    .useValue(
      new ConfigService({
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: '',
        JWT_SECRET: 'test_jwt_secret',
        JWT_REFRESH_SECRET: 'test_jwt_refresh_secret',
        // Add other necessary environment variables here
      }),
    )
    // Override RedisService with the mock
    .overrideProvider(RedisService)
    .useValue(mockRedisService)
    .compile();

  // Initialize the Nest application
  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  if (con) {
    await con.close();
  }
});

beforeEach(async () => {
  // Reset the database before each test to ensure test isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

export { app };
