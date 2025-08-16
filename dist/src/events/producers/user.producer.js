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
exports.UserEventProducer = void 0;
const kafka_1 = require("../../config/kafka");
class UserEventProducer {
    /**
     * Publishes a user created event to Kafka.
     */
    static userCreated(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, kafka_1.sendEvent)('user.created', {
                type: 'USER_CREATED',
                data: user,
                timestamp: new Date().toISOString()
            });
        });
    }
    /**
     * Publishes a user authenticated (login) event to Kafka.
     */
    static userAuthenticated(userId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, kafka_1.sendEvent)('user.authenticated', {
                type: 'USER_AUTHENTICATED',
                data: Object.assign({ userId }, metadata),
                timestamp: new Date().toISOString()
            });
        });
    }
    /**
     * Publishes a user password changed event to Kafka.
     */
    static userPasswordChanged(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, kafka_1.sendEvent)('user.password_changed', {
                type: 'USER_PASSWORD_CHANGED',
                data: {
                    userId
                },
                timestamp: new Date().toISOString()
            });
        });
    }
    /**
     * Publishes a user locked event to Kafka.
     */
    static userLocked(userId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, kafka_1.sendEvent)('user.locked', {
                type: 'USER_LOCKED',
                data: {
                    userId,
                    reason
                },
                timestamp: new Date().toISOString()
            });
        });
    }
    /**
     * Publishes a user unlocked event to Kafka.
     */
    static userUnlocked(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, kafka_1.sendEvent)('user.unlocked', {
                type: 'USER_UNLOCKED',
                data: {
                    userId
                },
                timestamp: new Date().toISOString()
            });
        });
    }
}
exports.UserEventProducer = UserEventProducer;
