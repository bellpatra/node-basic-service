import { Consumer } from 'kafkajs';
import { createConsumer } from '../../config/kafka';
import { config } from '../../config';
import { cacheSet } from '../../config/redis';

export class UserEventConsumer {
  private consumer: Consumer;

  constructor() {
    this.consumer = createConsumer(`${config.kafka.groupId}-user-events`);
  }

  async start() {
    await this.consumer.connect();
    await this.setupSubscriptions();
  }

  private async setupSubscriptions() {
    // Subscribe to user.created events
    await this.consumer.subscribe({
      topics: ['user.created'],
      fromBeginning: true
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        const event = JSON.parse(message.value.toString());

        switch (topic) {
          case 'user.created':
            await this.handleUserCreated(event);
            break;
          case 'user.authenticated':
            await this.handleUserAuthenticated(event);
            break;
          default:
            console.log(`Unhandled topic ${topic}`);
        }
      }
    });
  }

  private async handleUserCreated(event: any) {
    try {
      const { data } = event;
      // Cache user data
      await cacheSet(`user:${data.id}`, data, 3600); // Cache for 1 hour
      
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
    } catch (error) {
      console.error('Error handling user created event:', error);
    }
  }

  private async handleUserAuthenticated(event: any) {
    try {
      const { data } = event;
      // Update last login timestamp
      await cacheSet(`user:${data.userId}:lastLogin`, {
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
    } catch (error) {
      console.error('Error handling user authenticated event:', error);
    }
  }

  async stop() {
    await this.consumer.disconnect();
  }
}

// Export a function to initialize the consumer
export const initializeUserEventConsumer = async () => {
  const consumer = new UserEventConsumer();
  await consumer.start();
  return consumer;
};