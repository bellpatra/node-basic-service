import { Request, Response } from 'express';
import { QRService } from './qr.service';
import { ApiResponse } from '../../utils/validation';
import { Logger } from '../../utils/logger';
import QRCode from 'qrcode';
import { config } from '../../config';
import prisma from '../../config/prisma';
import { SecurityUtils } from '../../utils/security';

export class QRController {
  /**
   * Generates a new QR code for authentication
   */
  static async generateQRCode(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const userId = (req as any).user.id;
        const { type, customData, expiryMinutes, maxUsage } = req.body;

        if (!type || !['API', 'EXPLANATION', 'MAGIC_LINK'].includes(type)) {
          throw new Error('Invalid QR code type. Must be API, EXPLANATION, or MAGIC_LINK');
        }

        const result = await QRService.generateQRCode(userId, {
          type,
          customData,
          expiryMinutes,
          maxUsage
        });

        return {
          qrCode: result.qrCode,
          qrImage: result.qrImage
        };
      },
      'QR code generated successfully',
      201
    );
  }

  /**
   * Verifies a QR code and authenticates the user
   */
  static async verifyQRCode(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const { code, qrData } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        if (!code) {
          throw new Error('QR code is required');
        }

        const result = await QRService.verifyQRCode({
          code,
          ip,
          userAgent,
          qrData
        });

        return {
          user: result.user,
          token: result.token,
          method: result.method
        };
      },
      'QR authentication successful'
    );
  }

  /**
   * Gets QR code statistics (admin/moderator only)
   */
  static async getQRStats(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const stats = await QRService.getQRStats();
        return stats;
      },
      'QR statistics retrieved successfully'
    );
  }

  /**
   * Gets user's QR codes
   */
  static async getUserQRCodes(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const userId = (req as any).user.id;
        const qrCodes = await QRService.getUserQRCodes(userId);
        return { qrCodes };
      },
      'User QR codes retrieved successfully'
    );
  }

  /**
   * Deactivates a QR code
   */
  static async deactivateQRCode(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const userId = (req as any).user.id;
        const { code } = req.params;

        await QRService.deactivateQRCode(code, userId);
        return { message: 'QR code deactivated successfully' };
      },
      'QR code deactivated successfully'
    );
  }

  /**
   * Generates a session QR code for frontend display (like WhatsApp Web)
   */
  static async generateSessionQRCode(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Generate a simple session QR code
        const qrData = {
          sessionId,
          endpoint: `${config.apiBaseUrl}/api/qr/verify-session`,
          timestamp: new Date().toISOString()
        };

        // Generate QR code image
        const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

        // Set expiry to 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        return {
          sessionId,
          qrCode: qrImage,
          expiresAt: expiresAt.toISOString(),
          refreshInterval: 5000 // 5 seconds for frontend auto-refresh
        };
      },
      'Session QR code generated successfully'
    );
  }

  /**
   * Verifies a session QR code for auto-login (like WhatsApp Web)
   */
  static async verifySessionQRCode(req: Request, res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        const { sessionId, userId } = req.body;

        if (!sessionId || !userId) {
          throw new Error('Session ID and User ID are required');
        }

        // Get user information
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true,
            isActive: true
          }
        });

        if (!user) {
          throw new Error('User not found');
        }

        if (!user.isActive) {
          throw new Error('User account is deactivated');
        }

        // Generate JWT token
        const token = SecurityUtils.generateToken({
          userId: user.id,
          username: user.username
        });

        // Update user's last login and token
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            lastLogin: new Date(),
            token: token
          }
        });

        // Log successful login
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            method: 'qr_session',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success: true,
            metadata: {
              sessionId,
              verificationTime: new Date().toISOString()
            }
          }
        });

        // Emit WebSocket event for real-time frontend updates
        // Note: WebSocket events are handled in the main server file
        Logger.info(`Session QR code verified for user ${user.username}`);

        return {
          user,
          token,
          method: 'qr_session'
        };
      },
      'Session verified successfully'
    );
  }
}
