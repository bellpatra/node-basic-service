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
exports.initializeUserEventConsumer = exports.UserEventConsumer = void 0;
const kafka_1 = require("../../config/kafka");
const config_1 = require("../../config");
const redis_1 = require("../../config/redis");
class UserEventConsumer {
    constructor() {
        this.consumer = (0, kafka_1.createConsumer)(`${config_1.config.kafka.groupId}-user-events`);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumer.connect();
            yield this.setupSubscriptions();
        });
    }
    setupSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            // Subscribe to user.created events
            yield this.consumer.subscribe({
                topics: ['user.created'],
                fromBeginning: true
            });
            yield this.consumer.run({
                eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, message }) {
                    if (!message.value)
                        return;
                    const event = JSON.parse(message.value.toString());
                    switch (topic) {
                        case 'user.created':
                            yield this.handleUserCreated(event);
                            break;
                        case 'user.authenticated':
                            yield this.handleUserAuthenticated(event);
                            break;
                        default:
                            console.log(`Unhandled topic ${topic}`);
                    }
                })
            });
        });
    }
    handleUserCreated(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = event;
                // Cache user data
                yield (0, redis_1.cacheSet)(`user:${data.id}`, data, 3600); // Cache for 1 hour
                // Log the event
                console.log('User created event processed:', {
                    userId: data.id,
                    timestamp: event.timestamp
                });
                // Here you could:
                // 1. Send welcome email
                // 2. Create initial profile
                // 3. Setup default preferences
                // 4. Notify other services
            }
            catch (error) {
                console.error('Error handling user created event:', error);
            }
        });
    }
    handleUserAuthenticated(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = event;
                // Update last login timestamp
                yield (0, redis_1.cacheSet)(`user:${data.userId}:lastLogin`, {
                    timestamp: event.timestamp,
                    metadata: data
                });
                // Log the authentication
                console.log('User authenticated:', {
                    userId: data.userId,
                    timestamp: event.timestamp,
                    ip: data.ip,
                    device: data.device
                });
                // Here you could:
                // 1. Update login history
                // 2. Check for suspicious activity
                // 3. Update user metrics
            }
            catch (error) {
                console.error('Error handling user authenticated event:', error);
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumer.disconnect();
        });
    }
}
exports.UserEventConsumer = UserEventConsumer;
// Export a function to initialize the consumer
const initializeUserEventConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    const consumer = new UserEventConsumer();
    yield consumer.start();
    return consumer;
});
exports.initializeUserEventConsumer = initializeUserEventConsumer;
