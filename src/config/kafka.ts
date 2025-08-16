import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { config } from '.';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  logLevel: logLevel.INFO,
});

export const producer = kafka.producer();

/**
 * Returns a Kafka consumer for the given group ID.
 */
export const createConsumer = (groupId: string): Consumer => {
  return kafka.consumer({ groupId });
};

/**
 * Connects the Kafka producer.
 */
export const initializeKafka = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
    throw error;
  }
};

/**
 * Sends an event message to the specified Kafka topic.
 */
export const sendEvent = async (topic: string, message: any) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Subscribes a consumer to a topic and handles incoming messages with the provided handler.
 */
export const subscribeToTopic = async (
  consumer: Consumer,
  topic: string,
  handler: (message: any) => Promise<void>
) => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const data = JSON.parse(message.value.toString());
          await handler(data);
        }
      },
    });

    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
    throw error;
  }
};
