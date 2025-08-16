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
exports.QRController = void 0;
const qr_service_1 = require("./qr.service");
const validation_1 = require("../../utils/validation");
const logger_1 = require("../../utils/logger");
const qrcode_1 = __importDefault(require("qrcode"));
const config_1 = require("../../config");
const prisma_1 = __importDefault(require("../../config/prisma"));
const security_1 = require("../../utils/security");
class QRController {
    /**
     * Generates a new QR code for authentication
     */
    static generateQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const userId = req.user.id;
                const { type, customData, expiryMinutes, maxUsage } = req.body;
                if (!type || !['API', 'EXPLANATION', 'MAGIC_LINK'].includes(type)) {
                    throw new Error('Invalid QR code type. Must be API, EXPLANATION, or MAGIC_LINK');
                }
                const result = yield qr_service_1.QRService.generateQRCode(userId, {
                    type,
                    customData,
                    expiryMinutes,
                    maxUsage
                });
                return {
                    qrCode: result.qrCode,
                    qrImage: result.qrImage
                };
            }), 'QR code generated successfully', 201);
        });
    }
    /**
     * Verifies a QR code and authenticates the user
     */
    static verifyQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { code, qrData } = req.body;
                const ip = req.ip || req.connection.remoteAddress;
                const userAgent = req.get('User-Agent');
                if (!code) {
                    throw new Error('QR code is required');
                }
                const result = yield qr_service_1.QRService.verifyQRCode({
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
            }), 'QR authentication successful');
        });
    }
    /**
     * Gets QR code statistics (admin/moderator only)
     */
    static getQRStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const stats = yield qr_service_1.QRService.getQRStats();
                return stats;
            }), 'QR statistics retrieved successfully');
        });
    }
    /**
     * Gets user's QR codes
     */
    static getUserQRCodes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const userId = req.user.id;
                const qrCodes = yield qr_service_1.QRService.getUserQRCodes(userId);
                return { qrCodes };
            }), 'User QR codes retrieved successfully');
        });
    }
    /**
     * Deactivates a QR code
     */
    static deactivateQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const userId = req.user.id;
                const { code } = req.params;
                yield qr_service_1.QRService.deactivateQRCode(code, userId);
                return { message: 'QR code deactivated successfully' };
            }), 'QR code deactivated successfully');
        });
    }
    /**
     * Generates a session QR code for frontend display (like WhatsApp Web)
     */
    static generateSessionQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                // Generate a simple session QR code
                const qrData = {
                    sessionId,
                    endpoint: `${config_1.config.apiBaseUrl}/api/qr/verify-session`,
                    timestamp: new Date().toISOString()
                };
                // Generate QR code image
                const qrImage = yield qrcode_1.default.toDataURL(JSON.stringify(qrData));
                // Set expiry to 5 minutes
                const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
                return {
                    sessionId,
                    qrCode: qrImage,
                    expiresAt: expiresAt.toISOString(),
                    refreshInterval: 5000 // 5 seconds for frontend auto-refresh
                };
            }), 'Session QR code generated successfully');
        });
    }
    /**
     * Verifies a session QR code for auto-login (like WhatsApp Web)
     */
    static verifySessionQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { sessionId, userId } = req.body;
                if (!sessionId || !userId) {
                    throw new Error('Session ID and User ID are required');
                }
                // Get user information
                const user = yield prisma_1.default.user.findUnique({
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
                const token = security_1.SecurityUtils.generateToken({
                    userId: user.id,
                    username: user.username
                });
                // Update user's last login and token
                yield prisma_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        lastLogin: new Date(),
                        token: token
                    }
                });
                // Log successful login
                yield prisma_1.default.loginHistory.create({
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
                logger_1.Logger.info(`Session QR code verified for user ${user.username}`);
                return {
                    user,
                    token,
                    method: 'qr_session'
                };
            }), 'Session verified successfully');
        });
    }
}
exports.QRController = QRController;
