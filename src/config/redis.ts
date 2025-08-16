import Redis from 'ioredis';
import { config } from '.';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy: times => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', error => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

export default redis;

// Cache utilities
export const cacheSet = async (key: string, value: any, expireSeconds?: number) => {
  const stringValue = JSON.stringify(value);
  if (expireSeconds) {
    await redis.setex(key, expireSeconds, stringValue);
  } else {
    await redis.set(key, stringValue);
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
};

export const cacheDelete = async (key: string) => {
  await redis.del(key);
};
