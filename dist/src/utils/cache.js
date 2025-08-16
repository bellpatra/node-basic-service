"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.cacheMiddleware = exports.CacheService = void 0;
const ioredis_1 = require("ioredis");
const config_1 = require("../config");
const redis = new ioredis_1.Redis(config_1.config.redis.url);
/**
 * Service for interacting with Redis cache (get, set, delete, clear pattern).
 */
class CacheService {
    static get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield redis.get(key);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                console.error('Cache get error:', error);
                return null;
            }
        });
    }
    static set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, expireSeconds = 3600) {
            try {
                yield redis.set(key, JSON.stringify(value), 'EX', expireSeconds);
            }
            catch (error) {
                console.error('Cache set error:', error);
            }
        });
    }
    static del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield redis.del(key);
            }
            catch (error) {
                console.error('Cache delete error:', error);
            }
        });
    }
    static clearPattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = yield redis.keys(pattern);
                if (keys.length > 0) {
                    yield redis.del(...keys);
                }
            }
            catch (error) {
                console.error('Cache clear pattern error:', error);
            }
        });
    }
}
exports.CacheService = CacheService;
/**
 * Middleware to cache GET responses using Redis with a configurable key prefix and expiration.
 */
const cacheMiddleware = (keyPrefix, expireSeconds = 3600) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = `${keyPrefix}:${req.originalUrl}`;
        try {
            const cachedData = yield CacheService.get(cacheKey);
            if (cachedData) {
                return res.json(cachedData);
            }
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                CacheService.set(cacheKey, body, expireSeconds);
                return originalJson(body);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    });
};
exports.cacheMiddleware = cacheMiddleware;
/**
 * In-memory rate limiter middleware for Express based on IP address.
 */
const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
    const requests = new Map();
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;
        if (!ip || !requests.has(ip)) {
            if (ip)
                requests.set(ip, [now]);
            return next();
        }
        const userRequests = requests.get(ip);
        const recentRequests = userRequests.filter(time => time > windowStart);
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests, please try again later.'
            });
        }
        recentRequests.push(now);
        requests.set(ip, recentRequests);
        next();
    });
};
exports.rateLimiter = rateLimiter;
