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
exports.subscribeToTopic = exports.sendEvent = exports.initializeKafka = exports.createConsumer = exports.producer = void 0;
const kafkajs_1 = require("kafkajs");
const _1 = require(".");
const kafka = new kafkajs_1.Kafka({
    clientId: _1.config.kafka.clientId,
    brokers: _1.config.kafka.brokers,
    logLevel: kafkajs_1.logLevel.INFO,
});
exports.producer = kafka.producer();
/**
 * Returns a Kafka consumer for the given group ID.
 */
const createConsumer = (groupId) => {
    return kafka.consumer({ groupId });
};
exports.createConsumer = createConsumer;
/**
 * Connects the Kafka producer.
 */
const initializeKafka = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.producer.connect();
        console.log('Kafka producer connected');
    }
    catch (error) {
        console.error('Error connecting to Kafka:', error);
        throw error;
    }
});
exports.initializeKafka = initializeKafka;
/**
 * Sends an event message to the specified Kafka topic.
 */
const sendEvent = (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    }
    catch (error) {
        console.error(`Error sending message to topic ${topic}:`, error);
        throw error;
    }
});
exports.sendEvent = sendEvent;
/**
 * Subscribes a consumer to a topic and handles incoming messages with the provided handler.
 */
const subscribeToTopic = (consumer, topic, handler) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield consumer.connect();
        yield consumer.subscribe({ topic, fromBeginning: true });
        yield consumer.run({
            eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ message }) {
                if (message.value) {
                    const data = JSON.parse(message.value.toString());
                    yield handler(data);
                }
            }),
        });
        console.log(`Subscribed to topic: ${topic}`);
    }
    catch (error) {
        console.error(`Error subscribing to topic ${topic}:`, error);
        throw error;
    }
});
exports.subscribeToTopic = subscribeToTopic;
