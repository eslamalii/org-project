import { ConfigService } from '@nestjs/config';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';

export const getRedisConfig = (
  configService: ConfigService,
): RedisModuleOptions => ({
  config: {
    host: configService.get<string>('REDIS_HOST') || 'localhost',
    port: configService.get<number>('REDIS_PORT') || 6379,
    password: configService.get<string>('REDIS_PASSWORD') || '',
  },
});
