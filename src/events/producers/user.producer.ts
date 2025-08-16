import { sendEvent } from '../../config/kafka';
import { IUser } from '../../modules/user/user.interface';

export class UserEventProducer {
  /**
   * Publishes a user created event to Kafka.
   */
  static async userCreated(user: Omit<IUser, 'password'>) {
    await sendEvent('user.created', {
      type: 'USER_CREATED',
      data: user,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Publishes a user authenticated (login) event to Kafka.
   */
  static async userAuthenticated(userId: string, metadata: {
    ip?: string;
    device?: string;
    location?: string;
  }) {
    await sendEvent('user.authenticated', {
      type: 'USER_AUTHENTICATED',
      data: {
        userId,
        ...metadata
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Publishes a user password changed event to Kafka.
   */
  static async userPasswordChanged(userId: string) {
    await sendEvent('user.password_changed', {
      type: 'USER_PASSWORD_CHANGED',
      data: {
        userId
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Publishes a user locked event to Kafka.
   */
  static async userLocked(userId: string, reason: string) {
    await sendEvent('user.locked', {
      type: 'USER_LOCKED',
      data: {
        userId,
        reason
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Publishes a user unlocked event to Kafka.
   */
  static async userUnlocked(userId: string) {
    await sendEvent('user.unlocked', {
      type: 'USER_UNLOCKED',
      data: {
        userId
      },
      timestamp: new Date().toISOString()
    });
  }
}