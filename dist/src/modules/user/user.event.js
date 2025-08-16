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
exports.setupUserEventConsumers = exports.UserEvents = exports.UserEventTypes = void 0;
const kafka_1 = require("../../config/kafka");
var UserEventTypes;
(function (UserEventTypes) {
    UserEventTypes["USER_CREATED"] = "user.created";
    UserEventTypes["USER_UPDATED"] = "user.updated";
    UserEventTypes["USER_DELETED"] = "user.deleted";
    UserEventTypes["USER_LOGIN"] = "user.login";
})(UserEventTypes || (exports.UserEventTypes = UserEventTypes = {}));
class UserEvents {
    static emitUserCreated(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, kafka_1.sendEvent)(UserEventTypes.USER_CREATED, {
                    eventType: UserEventTypes.USER_CREATED,
                    data: user,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error emitting user created event:', error);
            }
        });
    }
    static emitUserLogin(userId, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, kafka_1.sendEvent)(UserEventTypes.USER_LOGIN, {
                    eventType: UserEventTypes.USER_LOGIN,
                    data: {
                        userId,
                        metadata,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                console.error('Error emitting user login event:', error);
            }
        });
    }
}
exports.UserEvents = UserEvents;
// Event Consumers
const setupUserEventConsumers = (consumer) => __awaiter(void 0, void 0, void 0, function* () {
    // Example consumer for user events
    yield consumer.subscribe({
        topic: UserEventTypes.USER_CREATED,
        fromBeginning: true
    });
    yield consumer.run({
        eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ message }) {
            try {
                const event = JSON.parse(message.value.toString());
                console.log('Received user created event:', event);
                // Handle the event (e.g., send welcome email, notify other services)
            }
            catch (error) {
                console.error('Error processing user created event:', error);
            }
        })
    });
});
exports.setupUserEventConsumers = setupUserEventConsumers;
