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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheDelete = exports.cacheGet = exports.cacheSet = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const _1 = require(".");
const redis = new ioredis_1.default({
    host: _1.config.redis.host,
    port: _1.config.redis.port,
    password: _1.config.redis.password,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});
redis.on('connect', () => {
    console.log('Redis client connected');
});
exports.default = redis;
// Cache utilities
const cacheSet = (key, value, expireSeconds) => __awaiter(void 0, void 0, void 0, function* () {
    const stringValue = JSON.stringify(value);
    if (expireSeconds) {
        yield redis.setex(key, expireSeconds, stringValue);
    }
    else {
        yield redis.set(key, stringValue);
    }
});
exports.cacheSet = cacheSet;
const cacheGet = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const value = yield redis.get(key);
    if (!value)
        return null;
    return JSON.parse(value);
});
exports.cacheGet = cacheGet;
const cacheDelete = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield redis.del(key);
});
exports.cacheDelete = cacheDelete;
