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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const email_service_1 = require("../../services/email.service");
const validation_1 = require("../../utils/validation");
class EmailController {
    /**
     * Test email service connection
     */
    static testConnection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const status = yield email_service_1.emailService.getServiceStatus();
                return status;
            }), 'Email service status retrieved successfully');
        });
    }
    /**
     * Send test email
     */
    static sendTestEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { to, template } = req.body;
                if (!to) {
                    throw new Error('Email address is required');
                }
                let result = false;
                const appName = 'Node Basic Service';
                const supportUrl = 'https://yourdomain.com/support';
                switch (template) {
                    case 'welcome':
                        result = yield email_service_1.emailService.sendWelcomeEmail({
                            username: 'Test User',
                            email: to,
                            appName,
                            loginUrl: 'https://yourdomain.com/login',
                            supportUrl,
                            createdAt: new Date().toLocaleDateString(),
                        });
                        break;
                    case 'password-reset':
                        result = yield email_service_1.emailService.sendPasswordResetEmail({
                            username: 'Test User',
                            email: to,
                            appName,
                            resetUrl: 'https://yourdomain.com/reset-password?token=test',
                            supportUrl,
                            requestTime: new Date().toLocaleString(),
                            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
                        });
                        break;
                    case 'qr-auth':
                        result = yield email_service_1.emailService.sendQRAuthEmail({
                            username: 'Test User',
                            email: to,
                            qrCodeUrl: 'https://via.placeholder.com/200x200/25d366/ffffff?text=QR+Code',
                            qrCodeId: 'test-qr-123',
                            appName,
                            supportUrl,
                            generatedAt: new Date().toLocaleString(),
                            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toLocaleString(),
                            qrCodeType: 'API',
                        });
                        break;
                    case 'verification':
                        result = yield email_service_1.emailService.sendAccountVerificationEmail({
                            username: 'Test User',
                            email: to,
                            appName,
                            verificationUrl: 'https://yourdomain.com/verify?token=test',
                            supportUrl,
                            registrationDate: new Date().toLocaleDateString(),
                            expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
                        });
                        break;
                    case 'notification':
                        result = yield email_service_1.emailService.sendNotificationEmail({
                            username: 'Test User',
                            email: to,
                            notificationTitle: 'Test Notification',
                            notificationSubtitle: 'This is a test notification',
                            notificationMessage: 'This is a test notification message to verify the email service is working correctly.',
                            notificationIcon: '🔔',
                            notificationType: 'Test',
                            notificationTime: new Date().toLocaleString(),
                            appName,
                            supportUrl,
                            actionUrl: 'https://yourdomain.com/notifications',
                            actionButtonText: 'View Notifications',
                            additionalInfo: 'This is additional information for testing purposes.',
                        });
                        break;
                    default:
                        // Send a simple test email
                        result = yield email_service_1.emailService.sendEmail({
                            to,
                            subject: '🧪 Test Email from Node Basic Service',
                            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #667eea;">🧪 Test Email</h1>
                  <p>This is a test email to verify the email service is working correctly.</p>
                  <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Service:</strong> Node Basic Service</p>
                  <hr style="margin: 20px 0;">
                  <p style="color: #666; font-size: 12px;">This is an automated test email.</p>
                </div>
              `,
                        });
                }
                if (result) {
                    return { message: `Test email sent successfully to ${to}`, template: template || 'simple' };
                }
                else {
                    throw new Error('Failed to send test email');
                }
            }), 'Test email sent successfully');
        });
    }
    /**
     * Send welcome email
     */
    static sendWelcomeEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { username, email, appName, loginUrl, supportUrl, createdAt } = req.body;
                if (!username || !email || !appName) {
                    throw new Error('Username, email, and appName are required');
                }
                const result = yield email_service_1.emailService.sendWelcomeEmail({
                    username,
                    email,
                    appName,
                    loginUrl: loginUrl || 'https://yourdomain.com/login',
                    supportUrl: supportUrl || 'https://yourdomain.com/support',
                    createdAt: createdAt || new Date().toLocaleDateString(),
                });
                if (result) {
                    return { message: `Welcome email sent successfully to ${email}` };
                }
                else {
                    throw new Error('Failed to send welcome email');
                }
            }), 'Welcome email sent successfully');
        });
    }
    /**
     * Send password reset email
     */
    static sendPasswordResetEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { username, email, appName, resetUrl, supportUrl, requestTime, expiryTime } = req.body;
                if (!username || !email || !appName || !resetUrl) {
                    throw new Error('Username, email, appName, and resetUrl are required');
                }
                const result = yield email_service_1.emailService.sendPasswordResetEmail({
                    username,
                    email,
                    appName,
                    resetUrl,
                    supportUrl: supportUrl || 'https://yourdomain.com/support',
                    requestTime: requestTime || new Date().toLocaleString(),
                    expiryTime: expiryTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
                });
                if (result) {
                    return { message: `Password reset email sent successfully to ${email}` };
                }
                else {
                    throw new Error('Failed to send password reset email');
                }
            }), 'Password reset email sent successfully');
        });
    }
    /**
     * Send QR authentication email
     */
    static sendQRAuthEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { username, qrCodeUrl, qrCodeId, appName, supportUrl, generatedAt, expiresAt, qrCodeType } = req.body;
                if (!username || !qrCodeUrl || !qrCodeId || !appName) {
                    throw new Error('Username, qrCodeUrl, qrCodeId, and appName are required');
                }
                const result = yield email_service_1.emailService.sendQRAuthEmail({
                    username,
                    email: req.body.email || 'noreply@example.com',
                    qrCodeUrl,
                    qrCodeId,
                    appName,
                    supportUrl: supportUrl || 'https://yourdomain.com/support',
                    generatedAt: generatedAt || new Date().toLocaleString(),
                    expiresAt: expiresAt || new Date(Date.now() + 5 * 60 * 1000).toLocaleString(),
                    qrCodeType: qrCodeType || 'API',
                });
                if (result) {
                    return { message: `QR authentication email sent successfully` };
                }
                else {
                    throw new Error('Failed to send QR authentication email');
                }
            }), 'QR authentication email sent successfully');
        });
    }
    /**
     * Send bulk emails
     */
    static sendBulkEmails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const { emails } = req.body;
                if (!emails || !Array.isArray(emails) || emails.length === 0) {
                    throw new Error('Emails array is required and must not be empty');
                }
                const result = yield email_service_1.emailService.sendBulkEmails(emails);
                return {
                    message: `Bulk email sending completed`,
                    success: result.success,
                    failed: result.failed,
                    total: emails.length,
                };
            }), 'Bulk emails sent successfully');
        });
    }
}
exports.EmailController = EmailController;
