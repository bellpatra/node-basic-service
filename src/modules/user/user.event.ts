import { sendEvent } from '../../config/kafka';
import { IUser } from './user.interface';

export enum UserEventTypes {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login'
}

export class UserEvents {
  static async emitUserCreated(user: Omit<IUser, 'password'>) {
    try {
      await sendEvent(UserEventTypes.USER_CREATED, {
        eventType: UserEventTypes.USER_CREATED,
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error emitting user created event:', error);
    }
  }

  static async emitUserLogin(userId: string, metadata: { ip?: string; userAgent?: string }) {
    try {
      await sendEvent(UserEventTypes.USER_LOGIN, {
        eventType: UserEventTypes.USER_LOGIN,
        data: {
          userId,
          metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error emitting user login event:', error);
    }
  }
}

// Event Consumers
export const setupUserEventConsumers = async (consumer: any) => {
  // Example consumer for user events
  await consumer.subscribe({
    topic: UserEventTypes.USER_CREATED,
    fromBeginning: true
  });

  await consumer.run({
    eachMessage: async ({ message }: { message: any }) => {
      try {
        const event = JSON.parse(message.value.toString());
        console.log('Received user created event:', event);
        // Handle the event (e.g., send welcome email, notify other services)
      } catch (error) {
        console.error('Error processing user created event:', error);
      }
    }
  });
};