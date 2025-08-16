import { Request, Response } from 'express';
import { QRService } from './qr.service';
import { ApiResponse } from '../../utils/validation';
import { Logger } from '../../utils/logger';

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
}
