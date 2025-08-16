import { Redis } from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

const redis = new Redis(config.redis.url);

/**
 * Service for interacting with Redis cache (get, set, delete, clear pattern).
 */
export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, expireSeconds = 3600): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', expireSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear pattern error:', error);
    }
  }
}

/**
 * Middleware to cache GET responses using Redis with a configurable key prefix and expiration.
 */
export const cacheMiddleware = (keyPrefix: string, expireSeconds = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl}`;
    try {
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        CacheService.set(cacheKey, body, expireSeconds);
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * In-memory rate limiter middleware for Express based on IP address.
 */
export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map<string, number[]>();

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!ip || !requests.has(ip)) {
      if (ip) requests.set(ip, [now]);
      return next();
    }

    const userRequests = requests.get(ip)!;
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later.',
      });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);

    next();
  };
};
