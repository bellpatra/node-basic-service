import prisma from '../../config/prisma';
import { SecurityUtils } from '../../utils/security';
import { CacheService } from '../../utils/cache';
import { Logger } from '../../utils/logger';
import { UserEventProducer } from '../../events/producers/user.producer';
import { config } from '../../config';
import { 
  IUser, 
  IUserCreate, 
  IUserLogin, 
  IUserUpdate, 
  IAuthResponse, 
  IAuthTokens, 
  IPasswordReset, 
  IPasswordResetConfirm 
} from './user.interface';
import { randomBytes } from 'crypto';
import { UserEvents } from './user.event';

// Cache keys
const USER_CACHE_KEY = 'user:';
const USER_TOKEN_CACHE_KEY = 'user:token:';
const PASSWORD_RESET_CACHE_KEY = 'password:reset:';

export class UserService {
  /**
   * Creates a new user in the database after checking for duplicates, hashes the password,
   * caches the user, and emits user created events.
   */
  static async createUser(userData: IUserCreate): Promise<Omit<IUser, 'password'>> {
    // Build OR conditions for uniqueness check
    const orConditions = [
      { username: userData.username },
      { email: userData.email }
    ];
    
    // Add phone to uniqueness check if provided
    if (userData.phone) {
      orConditions.push({ phone: userData.phone });
    }

    // Check if username, email, or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions
      }
    });

    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error('Username already taken');
      } else if (existingUser.email === userData.email) {
        throw new Error('Email already registered');
      } else if (existingUser.phone === userData.phone) {
        throw new Error('Phone number already registered');
      }
    }

    // Hash password
    const hashedPassword = await SecurityUtils.hashPassword(userData.password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        fullName: userData.fullName,
        role: userData.role || 'user',
        isActive: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Cache user data
    await CacheService.set(`${USER_CACHE_KEY}${user.id}`, userWithoutPassword, 3600);

    // Emit user created event
    try {
      await UserEvents.emitUserCreated(userWithoutPassword);
      await UserEventProducer.userCreated(userWithoutPassword);
    } catch (error) {
      Logger.error('Failed to emit user created event', error as Error);
    }

    return userWithoutPassword;
  }

  /**
   * Authenticates a user by username/email/phone and password, updates last login,
   * generates tokens, caches refresh token, and emits login events.
   */
  static async login(loginData: IUserLogin): Promise<IAuthResponse> {
    const { identifier, password } = loginData;

    // Find user by username, email, or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await SecurityUtils.comparePasswords(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateAuthTokens(user);
    
    // Cache refresh token
    await CacheService.set(`${USER_TOKEN_CACHE_KEY}${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Emit login event
    try {
      const metadata = {
        ip: '', // Will be set in controller
        userAgent: '' // Will be set in controller
      };
      await UserEvents.emitUserLogin(user.id, metadata);
      await UserEventProducer.userAuthenticated(user.id, metadata);
    } catch (error) {
      Logger.error('Failed to emit user login event', error as Error);
    }

    return {
      token: accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Validates and refreshes the access and refresh tokens for a user.
   */
  static async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      // Verify refresh token
      const payload = SecurityUtils.verifyRefreshToken(refreshToken);
      const { userId } = payload;

      // Get cached refresh token
      const cachedToken = await CacheService.get<string>(`${USER_TOKEN_CACHE_KEY}${userId}`);
      
      if (!cachedToken || cachedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = this.generateAuthTokens(user);
      
      // Update cached refresh token
      await CacheService.set(`${USER_TOKEN_CACHE_KEY}${userId}`, tokens.refreshToken, 30 * 24 * 60 * 60);

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Retrieves a user by ID, first checking the cache, then the database.
   */
  static async getUserById(id: string): Promise<Omit<IUser, 'password'> | null> {
    // Try to get from cache first
    const cachedUser = await CacheService.get<Omit<IUser, 'password'>>(`${USER_CACHE_KEY}${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    // Get from database
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) return null;

    // Remove password and cache
    const { password: _, ...userWithoutPassword } = user;
    await CacheService.set(`${USER_CACHE_KEY}${id}`, userWithoutPassword, 3600);
    
    return userWithoutPassword;
  }

  /**
   * Updates user profile information, including password change with validation,
   * and emits password changed event if applicable.
   */
  static async updateUser(userId: string, updateData: IUserUpdate): Promise<Omit<IUser, 'password'>> {
    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    // If changing password, verify current password
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new Error('Current password is required');
      }

      const isValidPassword = await SecurityUtils.comparePasswords(
        updateData.currentPassword,
        currentUser.password
      );

      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }
    }

    // Prepare update data
    const updateFields: any = {};
    
    if (updateData.fullName) updateFields.fullName = updateData.fullName;
    if (updateData.email) updateFields.email = updateData.email;
    if (updateData.phone) updateFields.phone = updateData.phone;
    if (updateData.newPassword) {
      updateFields.password = await SecurityUtils.hashPassword(updateData.newPassword);
      
      // Emit password changed event
      try {
        await UserEventProducer.userPasswordChanged(userId);
      } catch (error) {
        Logger.error('Failed to emit password changed event', error as Error);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateFields
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    // Update cache
    await CacheService.set(`${USER_CACHE_KEY}${userId}`, userWithoutPassword, 3600);

    return userWithoutPassword;
  }

  /**
   * Initiates a password reset process by generating a reset token and sending an email.
   */
  static async requestPasswordReset(email: string): Promise<void> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    
    // Store token in Redis with expiration (15 minutes)
    await CacheService.set(`${PASSWORD_RESET_CACHE_KEY}${resetToken}`, user.id, 15 * 60);

    // In a real application, send email with reset link
    Logger.info(`Password reset requested for ${email}. Token: ${resetToken}`);
  }

  /**
   * Resets the user's password using a valid reset token and new password.
   */
  static async resetPassword(resetData: IPasswordResetConfirm): Promise<void> {
    const { token, password } = resetData;

    // Get user ID from token
    const userId = await CacheService.get<string>(`${PASSWORD_RESET_CACHE_KEY}${token}`);
    
    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await SecurityUtils.hashPassword(password);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Delete token
    await CacheService.del(`${PASSWORD_RESET_CACHE_KEY}${token}`);
    
    // Invalidate user tokens
    await CacheService.del(`${USER_TOKEN_CACHE_KEY}${userId}`);

    // Emit password changed event
    try {
      await UserEventProducer.userPasswordChanged(userId);
    } catch (error) {
      Logger.error('Failed to emit password changed event', error as Error);
    }
  }

  /**
   * Generates access and refresh tokens for a user.
   */
  private static generateAuthTokens(user: IUser): IAuthTokens {
    const accessToken = SecurityUtils.generateToken({
      userId: user.id,
      username: user.username
    });

    const refreshToken = SecurityUtils.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken
    };
  }
}