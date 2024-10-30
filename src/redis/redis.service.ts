import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.redis.set(key, value, 'EX', ttl);
    }
    return await this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async flushall(): Promise<'OK'> {
    return await this.redis.flushall();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
