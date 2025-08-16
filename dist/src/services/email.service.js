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
exports.emailService = exports.EmailService = void 0;
const email_1 = require("../config/email");
const email_templates_1 = require("../templates/email-templates");
const logger_1 = require("../utils/logger");
class EmailService {
    constructor() {
        this.transporter = (0, email_1.getEmailTransporter)();
        this.defaultFrom = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
    }
    /**
     * Send a generic email
     */
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mailOptions = {
                    from: options.from || this.defaultFrom,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text || this.htmlToText(options.html),
                    attachments: options.attachments,
                };
                const result = yield this.transporter.sendMail(mailOptions);
                logger_1.Logger.info(`Email sent successfully to ${options.to}`, {
                    messageId: result.messageId,
                    subject: options.subject,
                });
                return true;
            }
            catch (error) {
                logger_1.Logger.error('Failed to send email', error);
                return false;
            }
        });
    }
    /**
     * Send welcome email
     */
    sendWelcomeEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, email_templates_1.welcomeEmailTemplate)(data);
            return this.sendEmail({
                to: data.email,
                subject: `🎉 Welcome to ${data.appName}!`,
                html,
            });
        });
    }
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, email_templates_1.passwordResetTemplate)(data);
            return this.sendEmail({
                to: data.email,
                subject: `🔒 Reset Your ${data.appName} Password`,
                html,
            });
        });
    }
    /**
     * Send QR authentication email
     */
    sendQRAuthEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, email_templates_1.qrAuthTemplate)(data);
            return this.sendEmail({
                to: data.email,
                subject: `📱 QR Code Authentication - ${data.appName}`,
                html,
            });
        });
    }
    /**
     * Send account verification email
     */
    sendAccountVerificationEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, email_templates_1.accountVerificationTemplate)(data);
            return this.sendEmail({
                to: data.email,
                subject: `✅ Verify Your ${data.appName} Account`,
                html,
            });
        });
    }
    /**
     * Send notification email
     */
    sendNotificationEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, email_templates_1.notificationTemplate)(data);
            return this.sendEmail({
                to: data.email,
                subject: `${data.notificationIcon} ${data.notificationTitle}`,
                html,
            });
        });
    }
    /**
     * Send bulk emails
     */
    sendBulkEmails(emails) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            let failed = 0;
            for (const email of emails) {
                const result = yield this.sendEmail(email);
                if (result) {
                    success++;
                }
                else {
                    failed++;
                }
            }
            logger_1.Logger.info(`Bulk email sending completed`, { success, failed });
            return { success, failed };
        });
    }
    /**
     * Test email configuration
     */
    testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.verify();
                logger_1.Logger.info('Email service connection verified successfully');
                return true;
            }
            catch (error) {
                logger_1.Logger.error('Email service connection failed', error);
                return false;
            }
        });
    }
    /**
     * Get email service status
     */
    getServiceStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const connected = yield this.testConnection();
            return {
                connected,
                provider: email_1.emailConfig.provider,
                host: email_1.emailConfig.host,
                port: email_1.emailConfig.port,
                secure: email_1.emailConfig.secure,
            };
        });
    }
    /**
     * Convert HTML to plain text
     */
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }
    /**
     * Update email configuration and recreate transporter
     */
    updateConfiguration() {
        this.transporter = (0, email_1.getEmailTransporter)();
        logger_1.Logger.info('Email service configuration updated');
    }
}
exports.EmailService = EmailService;
// Export singleton instance
exports.emailService = new EmailService();
