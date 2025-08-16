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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const security_1 = require("../../utils/security");
const cache_1 = require("../../utils/cache");
const logger_1 = require("../../utils/logger");
const qrcode_1 = __importDefault(require("qrcode"));
const uuid_1 = require("uuid");
const config_1 = require("../../config");
const server_1 = require("../../server");
// Cache keys
const QR_CACHE_KEY = 'qr:';
const QR_VERIFICATION_CACHE_KEY = 'qr:verification:';
class QRService {
    /**
     * Generates a new QR code for authentication
     */
    static generateQRCode(userId, qrData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, customData, expiryMinutes = 5, maxUsage } = qrData;
                // Generate unique code
                const code = (0, uuid_1.v4)();
                // Set expiry time
                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
                // Prepare QR data based on type
                let qrDataPayload = {};
                let metadata = {};
                switch (type) {
                    case 'API':
                        const apiToken = (0, uuid_1.v4)();
                        qrDataPayload = {
                            endpoint: `${config_1.config.apiBaseUrl || 'http://localhost:3000'}/api/qr/verify`,
                            token: apiToken,
                            userId: userId
                        };
                        metadata = Object.assign({ purpose: 'api_authentication', security: 'high' }, customData);
                        break;
                    case 'EXPLANATION':
                        qrDataPayload = {
                            explanation: (customData === null || customData === void 0 ? void 0 : customData.explanation) || 'Scan this QR code to access your account',
                            action: (customData === null || customData === void 0 ? void 0 : customData.action) || 'login',
                            userId: userId
                        };
                        metadata = Object.assign({ purpose: 'explanation_based', security: 'medium' }, customData);
                        break;
                    case 'MAGIC_LINK':
                        const magicToken = (0, uuid_1.v4)();
                        qrDataPayload = {
                            url: `${config_1.config.apiBaseUrl || 'http://localhost:3000'}/auth/magic/${magicToken}`,
                            token: magicToken,
                            userId: userId
                        };
                        metadata = Object.assign({ purpose: 'magic_link', security: 'high' }, customData);
                        break;
                }
                // Create QR code in database
                const qrCode = yield prisma_1.default.qRCode.create({
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
                const qrImageDataUrl = yield qrcode_1.default.toDataURL(JSON.stringify({
                    code,
                    type,
                    data: qrDataPayload,
                    expiresAt: expiresAt.toISOString()
                }));
                // Cache QR code for quick access
                yield cache_1.CacheService.set(`${QR_CACHE_KEY}${code}`, qrCode, expiryMinutes * 60);
                logger_1.Logger.info(`QR code generated for user ${userId}, type: ${type}, code: ${code}`);
                return {
                    qrCode: qrCode,
                    qrImage: qrImageDataUrl
                };
            }
            catch (error) {
                logger_1.Logger.error('QR code generation failed', error);
                throw new Error('Failed to generate QR code');
            }
        });
    }
    /**
     * Verifies a QR code and authenticates the user
     */
    static verifyQRCode(verifyData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, ip, userAgent, qrData } = verifyData;
                // Check cache first
                const cachedQR = yield cache_1.CacheService.get(`${QR_CACHE_KEY}${code}`);
                let qrCode = cachedQR;
                if (!qrCode) {
                    // Find QR code in database
                    qrCode = yield prisma_1.default.qRCode.findUnique({
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
                }
                else {
                    // If we have a cached QR code, we need to fetch the user separately
                    if (!qrCode.user && qrCode.userId) {
                        const user = yield prisma_1.default.user.findUnique({
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
                yield prisma_1.default.qRCode.update({
                    where: { id: qrCode.id },
                    data: { usageCount: { increment: 1 } }
                });
                // Log verification attempt
                yield prisma_1.default.qRVerification.create({
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
                const token = security_1.SecurityUtils.generateToken({
                    userId: qrCode.user.id,
                    username: qrCode.user.username
                });
                // Log successful login
                yield prisma_1.default.loginHistory.create({
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
                yield prisma_1.default.user.update({
                    where: { id: qrCode.user.id },
                    data: {
                        lastLogin: new Date(),
                        token: token
                    }
                });
                logger_1.Logger.info(`QR authentication successful for user ${qrCode.user.id}, type: ${qrCode.type}`);
                // Emit WebSocket event for real-time frontend updates
                if (server_1.io) {
                    server_1.io.emit('qr-authenticated', {
                        userId: qrCode.user.id,
                        username: qrCode.user.username,
                        email: qrCode.user.email,
                        timestamp: new Date().toISOString(),
                        qrCodeId: qrCode.id
                    });
                }
                return {
                    user: qrCode.user,
                    token,
                    method: `qr_${qrCode.type.toLowerCase()}`
                };
            }
            catch (error) {
                logger_1.Logger.error('QR verification failed', error);
                throw error;
            }
        });
    }
    /**
     * Gets QR code statistics for admin/moderator users
     */
    static getQRStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get overall statistics
                const totalGenerated = yield prisma_1.default.qRCode.count();
                const successfulLogins = yield prisma_1.default.qRVerification.count({
                    where: { success: true }
                });
                const failedAttempts = yield prisma_1.default.qRVerification.count({
                    where: { success: false }
                });
                // Get recent QR codes
                const recentCodes = yield prisma_1.default.qRCode.findMany({
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
            }
            catch (error) {
                logger_1.Logger.error('Failed to fetch QR statistics', error);
                throw new Error('Failed to fetch QR statistics');
            }
        });
    }
    /**
     * Gets user's QR codes
     */
    static getUserQRCodes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const qrCodes = yield prisma_1.default.qRCode.findMany({
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
                return qrCodes;
            }
            catch (error) {
                logger_1.Logger.error('Failed to fetch user QR codes', error);
                throw new Error('Failed to fetch user QR codes');
            }
        });
    }
    /**
     * Deactivates a QR code
     */
    static deactivateQRCode(code, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const qrCode = yield prisma_1.default.qRCode.findUnique({
                    where: { code }
                });
                if (!qrCode) {
                    throw new Error('QR code not found');
                }
                if (qrCode.userId !== userId) {
                    throw new Error('Not authorized to deactivate this QR code');
                }
                yield prisma_1.default.qRCode.update({
                    where: { code },
                    data: { isActive: false }
                });
                // Remove from cache
                yield cache_1.CacheService.del(`${QR_CACHE_KEY}${code}`);
                logger_1.Logger.info(`QR code ${code} deactivated by user ${userId}`);
            }
            catch (error) {
                logger_1.Logger.error('Failed to deactivate QR code', error);
                throw error;
            }
        });
    }
}
exports.QRService = QRService;
