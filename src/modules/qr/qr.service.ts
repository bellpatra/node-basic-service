import prisma from '../../config/prisma';
import { SecurityUtils } from '../../utils/security';
import { CacheService } from '../../utils/cache';
import { Logger } from '../../utils/logger';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';

// Cache keys
const QR_CACHE_KEY = 'qr:';
const QR_VERIFICATION_CACHE_KEY = 'qr:verification:';

export interface IQRCodeGenerate {
  type: 'API' | 'EXPLANATION' | 'MAGIC_LINK';
  customData?: any;
  expiryMinutes?: number;
  maxUsage?: number;
}

export interface IQRCodeVerify {
  code: string;
  ip?: string;
  userAgent?: string;
  qrData?: any;
}

export interface IQRCode {
  id: string;
  code: string;
  type: 'API' | 'EXPLANATION' | 'MAGIC_LINK';
  data: any;
  metadata?: any;
  expiresAt: Date;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQRCodeWithUser extends IQRCode {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    isActive: boolean;
  } | null;
}

export class QRService {
  /**
   * Generates a new QR code for authentication
   */
  static async generateQRCode(userId: string, qrData: IQRCodeGenerate): Promise<{ qrCode: IQRCode; qrImage: string }> {
    try {
      const { type, customData, expiryMinutes = 5, maxUsage } = qrData;

      // Generate unique code
      const code = uuidv4();
      
      // Set expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

      // Prepare QR data based on type
      let qrDataPayload = {};
      let metadata = {};

      switch (type) {
        case 'API':
          const apiToken = uuidv4();
          qrDataPayload = {
            endpoint: `${config.apiBaseUrl || 'http://localhost:3000'}/api/qr/verify`,
            token: apiToken,
            userId: userId
          };
          metadata = {
            purpose: 'api_authentication',
            security: 'high',
            ...customData
          };
          break;

        case 'EXPLANATION':
          qrDataPayload = {
            explanation: customData?.explanation || 'Scan this QR code to access your account',
            action: customData?.action || 'login',
            userId: userId
          };
          metadata = {
            purpose: 'explanation_based',
            security: 'medium',
            ...customData
          };
          break;

        case 'MAGIC_LINK':
          const magicToken = uuidv4();
          qrDataPayload = {
            url: `${config.apiBaseUrl || 'http://localhost:3000'}/auth/magic/${magicToken}`,
            token: magicToken,
            userId: userId
          };
          metadata = {
            purpose: 'magic_link',
            security: 'high',
            ...customData
          };
          break;
      }

      // Create QR code in database
      const qrCode = await prisma.qRCode.create({
        data: {
          code,
          type,
          data: qrDataPayload,
          metadata,
          expiresAt,
          userId: userId,
          maxUsage
        }
      });

      // Generate QR code image
      const qrImageDataUrl = await QRCode.toDataURL(JSON.stringify({
        code,
        type,
        data: qrDataPayload,
        expiresAt: expiresAt.toISOString()
      }));

      // Cache QR code for quick access
      await CacheService.set(`${QR_CACHE_KEY}${code}`, qrCode, expiryMinutes * 60);

      Logger.info(`QR code generated for user ${userId}, type: ${type}, code: ${code}`);

      return {
        qrCode: qrCode as IQRCode,
        qrImage: qrImageDataUrl
      };

    } catch (error) {
      Logger.error('QR code generation failed', error as Error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verifies a QR code and authenticates the user
   */
  static async verifyQRCode(verifyData: IQRCodeVerify): Promise<{ user: any; token: string; method: string }> {
    try {
      const { code, ip, userAgent, qrData } = verifyData;

      // Check cache first
      const cachedQR = await CacheService.get<IQRCode>(`${QR_CACHE_KEY}${code}`);
      let qrCode: IQRCodeWithUser | null = cachedQR as IQRCodeWithUser;

      if (!qrCode) {
        // Find QR code in database
        qrCode = await prisma.qRCode.findUnique({
          where: { code },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                fullName: true,
                isActive: true
              }
            }
          }
        });
      } else {
        // If we have a cached QR code, we need to fetch the user separately
        if (!qrCode.user && qrCode.userId) {
          const user = await prisma.user.findUnique({
            where: { id: qrCode.userId },
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
          qrCode.user = user;
        }
      }

      if (!qrCode) {
        throw new Error('QR code not found');
      }

      if (!qrCode.user) {
        throw new Error('QR code user not found');
      }

      if (!qrCode.isActive) {
        throw new Error('QR code is deactivated');
      }

      if (new Date() > qrCode.expiresAt) {
        throw new Error('QR code has expired');
      }

      if (qrCode.maxUsage && qrCode.usageCount >= qrCode.maxUsage) {
        throw new Error('QR code usage limit reached');
      }

      // Update usage count
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { usageCount: { increment: 1 } }
      });

      // Log verification attempt
      await prisma.qRVerification.create({
        data: {
          qrCodeId: qrCode.id,
          ipAddress: ip,
          userAgent: userAgent,
          success: true,
          metadata: {
            verificationTime: new Date().toISOString(),
            qrData: qrData || {}
          }
        }
      });

      // Generate JWT token for the user
      const token = SecurityUtils.generateToken({
        userId: qrCode.user.id,
        username: qrCode.user.username
      });

      // Log successful login
      await prisma.loginHistory.create({
        data: {
          userId: qrCode.user.id,
          method: `qr_${qrCode.type.toLowerCase()}`,
          ipAddress: ip,
          userAgent: userAgent,
          success: true,
          metadata: {
            qrCodeId: qrCode.id,
            verificationTime: new Date().toISOString()
          }
        }
      });

      // Update user's last login and token
      await prisma.user.update({
        where: { id: qrCode.user.id },
        data: { 
          lastLogin: new Date(),
          token: token
        }
      });

      Logger.info(`QR authentication successful for user ${qrCode.user.id}, type: ${qrCode.type}`);

      return {
        user: qrCode.user,
        token,
        method: `qr_${qrCode.type.toLowerCase()}`
      };

    } catch (error) {
      Logger.error('QR verification failed', error as Error);
      throw error;
    }
  }

  /**
   * Gets QR code statistics for admin/moderator users
   */
  static async getQRStats(): Promise<{ totalGenerated: number; successfulLogins: number; failedAttempts: number; recentCodes: any[] }> {
    try {
      // Get overall statistics
      const totalGenerated = await prisma.qRCode.count();
      const successfulLogins = await prisma.qRVerification.count({
        where: { success: true }
      });
      const failedAttempts = await prisma.qRVerification.count({
        where: { success: false }
      });

      // Get recent QR codes
      const recentCodes = await prisma.qRCode.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, email: true, firstName: true, lastName: true }
          }
        }
      });

      return {
        totalGenerated,
        successfulLogins,
        failedAttempts,
        recentCodes: recentCodes.map(code => ({
          id: code.id,
          code: code.code,
          type: code.type,
          createdAt: code.createdAt,
          user: code.user
        }))
      };

    } catch (error) {
      Logger.error('Failed to fetch QR statistics', error as Error);
      throw new Error('Failed to fetch QR statistics');
    }
  }

  /**
   * Gets user's QR codes
   */
  static async getUserQRCodes(userId: string): Promise<IQRCode[]> {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          type: true,
          data: true,
          metadata: true,
          expiresAt: true,
          isActive: true,
          usageCount: true,
          maxUsage: true,
          createdAt: true
        }
      });

      return qrCodes as IQRCode[];

    } catch (error) {
      Logger.error('Failed to fetch user QR codes', error as Error);
      throw new Error('Failed to fetch user QR codes');
    }
  }

  /**
   * Deactivates a QR code
   */
  static async deactivateQRCode(code: string, userId: string): Promise<void> {
    try {
      const qrCode = await prisma.qRCode.findUnique({
        where: { code }
      });

      if (!qrCode) {
        throw new Error('QR code not found');
      }

      if (qrCode.userId !== userId) {
        throw new Error('Not authorized to deactivate this QR code');
      }

      await prisma.qRCode.update({
        where: { code },
        data: { isActive: false }
      });

      // Remove from cache
      await CacheService.del(`${QR_CACHE_KEY}${code}`);

      Logger.info(`QR code ${code} deactivated by user ${userId}`);

    } catch (error) {
      Logger.error('Failed to deactivate QR code', error as Error);
      throw error;
    }
  }
}
