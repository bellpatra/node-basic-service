import { Request, Response } from 'express';
import { UserService } from './user.service';
import { 
  userCreateSchema, 
  userLoginSchema, 
  userUpdateSchema, 
  passwordResetRequestSchema, 
  passwordResetConfirmSchema,
  refreshTokenSchema 
} from './user.schema';
import { validateRequest } from '../../utils/validation';
import { ApiResponse } from '../../utils/validation';
import { Logger } from '../../utils/logger';

export class UserController {
  /**
   * Handles user registration by delegating to the service and returns the created user.
   */
  static async register(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const user = await UserService.createUser(req.body);
      return user;
    }, 'User registered successfully');
  }

  /**
   * Handles user login, sets refresh token cookie, and returns authentication response.
   */
  static async login(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      // Add IP and user agent to metadata for event tracking
      const authResponse = await UserService.login(req.body);
      
      // Set refresh token as HTTP-only cookie for better security
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/auth/refresh'
      });
      
      return authResponse;
    }, 'Login successful');
  }

  /**
   * Retrieves the authenticated user's profile information.
   */
  static async getProfile(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const user = await UserService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }, 'Profile retrieved successfully');
  }

  /**
   * Updates the authenticated user's profile information.
   */
  static async updateProfile(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      const updatedUser = await UserService.updateUser(userId, req.body);
      return updatedUser;
    }, 'Profile updated successfully');
  }

  /**
   * Handles refresh token logic and returns a new access token.
   */
  static async refreshToken(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      // Get refresh token from cookie or request body
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const tokens = await UserService.refreshToken(refreshToken);
      
      // Update refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/auth/refresh'
      });
      
      return { accessToken: tokens.accessToken };
    }, 'Token refreshed successfully');
  }

  /**
   * Initiates a password reset process for the given email address.
   */
  static async requestPasswordReset(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      await UserService.requestPasswordReset(req.body.email);
      return { message: 'If your email is registered, you will receive a password reset link' };
    }, 'Password reset requested');
  }

  /**
   * Resets the user's password using a provided reset token and new password.
   */
  static async resetPassword(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      await UserService.resetPassword(req.body);
      return { message: 'Password has been reset successfully' };
    }, 'Password reset successful');
  }

  /**
   * Logs out the user by clearing the refresh token cookie.
   */
  static async logout(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/api/auth/refresh'
      });
      
      return { message: 'Logged out successfully' };
    }, 'Logout successful');
  }
}