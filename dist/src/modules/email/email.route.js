"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controller_1 = require("./email.controller");
const validation_1 = require("../../utils/validation");
const zod_1 = require("zod");
// Email validation schemas
const testEmailSchema = zod_1.z.object({
    to: zod_1.z.string().email('Valid email address is required'),
    template: zod_1.z.enum(['welcome', 'password-reset', 'qr-auth', 'verification', 'notification']).optional(),
});
const welcomeEmailSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    email: zod_1.z.string().email('Valid email address is required'),
    appName: zod_1.z.string().min(1, 'App name is required'),
    loginUrl: zod_1.z.string().url('Valid login URL is required').optional(),
    supportUrl: zod_1.z.string().url('Valid support URL is required').optional(),
    createdAt: zod_1.z.string().optional(),
});
const passwordResetEmailSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    email: zod_1.z.string().email('Valid email address is required'),
    appName: zod_1.z.string().min(1, 'App name is required'),
    resetUrl: zod_1.z.string().url('Valid reset URL is required'),
    supportUrl: zod_1.z.string().url('Valid support URL is required').optional(),
    requestTime: zod_1.z.string().optional(),
    expiryTime: zod_1.z.string().optional(),
});
const qrAuthEmailSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    qrCodeUrl: zod_1.z.string().url('Valid QR code URL is required'),
    qrCodeId: zod_1.z.string().min(1, 'QR code ID is required'),
    appName: zod_1.z.string().min(1, 'App name is required'),
    supportUrl: zod_1.z.string().url('Valid support URL is required').optional(),
    generatedAt: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().optional(),
    qrCodeType: zod_1.z.string().optional(),
});
const bulkEmailSchema = zod_1.z.object({
    emails: zod_1.z.array(zod_1.z.object({
        to: zod_1.z.string().email('Valid email address is required'),
        subject: zod_1.z.string().min(1, 'Subject is required'),
        html: zod_1.z.string().min(1, 'HTML content is required'),
        text: zod_1.z.string().optional(),
        from: zod_1.z.string().email('Valid from email address').optional(),
    })).min(1, 'At least one email is required'),
});
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     TestEmailRequest:
 *       type: object
 *       required:
 *         - to
 *       properties:
 *         to:
 *           type: string
 *           format: email
 *           description: Recipient email address
 *         template:
 *           type: string
 *           enum: [welcome, password-reset, qr-auth, verification, notification]
 *           description: Email template to use for testing
 *
 *     WelcomeEmailRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - appName
 *       properties:
 *         username:
 *           type: string
 *           description: Recipient username
 *         email:
 *           type: string
 *           format: email
 *           description: Recipient email address
 *         appName:
 *           type: string
 *           description: Application name
 *         loginUrl:
 *           type: string
 *           format: uri
 *           description: Login URL for the welcome email
 *         supportUrl:
 *           type: string
 *           format: uri
 *           description: Support URL
 *         createdAt:
 *           type: string
 *           description: Account creation date
 *
 *     PasswordResetEmailRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - appName
 *         - resetUrl
 *       properties:
 *         username:
 *           type: string
 *           description: Recipient username
 *         email:
 *           type: string
 *           format: email
 *           description: Recipient email address
 *         appName:
 *           type: string
 *           description: Application name
 *         resetUrl:
 *           type: string
 *           format: uri
 *           description: Password reset URL
 *         supportUrl:
 *           type: string
 *           format: uri
 *           description: Support URL
 *         requestTime:
 *           type: string
 *           description: Password reset request time
 *         expiryTime:
 *           type: string
 *           description: Password reset expiry time
 *
 *     QRAuthEmailRequest:
 *       type: object
 *       required:
 *         - username
 *         - qrCodeUrl
 *         - qrCodeId
 *         - appName
 *       properties:
 *         username:
 *           type: string
 *           description: Recipient username
 *         qrCodeUrl:
 *           type: string
 *           format: uri
 *           description: QR code image URL
 *         qrCodeId:
 *           type: string
 *           description: QR code identifier
 *         appName:
 *           type: string
 *           description: Application name
 *         supportUrl:
 *           type: string
 *           format: uri
 *           description: Support URL
 *         generatedAt:
 *           type: string
 *           description: QR code generation time
 *         expiresAt:
 *           type: string
 *           description: QR code expiry time
 *         qrCodeType:
 *           type: string
 *           description: Type of QR code
 *
 *     BulkEmailRequest:
 *       type: object
 *       required:
 *         - emails
 *       properties:
 *         emails:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - html
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               html:
 *                 type: string
 *                 description: Email HTML content
 *               text:
 *                 type: string
 *                 description: Email plain text content
 *               from:
 *                 type: string
 *                 format: email
 *                 description: Sender email address
 *
 *     EmailServiceStatus:
 *       type: object
 *       properties:
 *         connected:
 *           type: boolean
 *           description: Whether the email service is connected
 *         provider:
 *           type: string
 *           description: Email service provider
 *         host:
 *           type: string
 *           description: SMTP host
 *         port:
 *           type: integer
 *           description: SMTP port
 *         secure:
 *           type: boolean
 *           description: Whether the connection is secure
 */
/**
 * @swagger
 * /api/email/test-connection:
 *   get:
 *     summary: Test email service connection
 *     tags: [Email]
 *     description: Test the connection to the configured email service
 *     responses:
 *       200:
 *         description: Email service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Email service status retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/EmailServiceStatus'
 *       500:
 *         description: Internal server error
 */
router.get('/test-connection', email_controller_1.EmailController.testConnection);
/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Send test email
 *     tags: [Email]
 *     description: Send a test email using various templates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestEmailRequest'
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Test email sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Test email sent successfully to test@example.com"
 *                     template:
 *                       type: string
 *                       example: "welcome"
 *       400:
 *         description: Bad request - Invalid email address
 *       500:
 *         description: Internal server error
 */
router.post('/test', (0, validation_1.validateRequest)(testEmailSchema), email_controller_1.EmailController.sendTestEmail);
/**
 * @swagger
 * /api/email/welcome:
 *   post:
 *     summary: Send welcome email
 *     tags: [Email]
 *     description: Send a beautiful welcome email to new users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WelcomeEmailRequest'
 *     responses:
 *       200:
 *         description: Welcome email sent successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/welcome', (0, validation_1.validateRequest)(welcomeEmailSchema), email_controller_1.EmailController.sendWelcomeEmail);
/**
 * @swagger
 * /api/email/password-reset:
 *   post:
 *     summary: Send password reset email
 *     tags: [Email]
 *     description: Send a secure password reset email with beautiful template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetEmailRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/password-reset', (0, validation_1.validateRequest)(passwordResetEmailSchema), email_controller_1.EmailController.sendPasswordResetEmail);
/**
 * @swagger
 * /api/email/qr-auth:
 *   post:
 *     summary: Send QR authentication email
 *     tags: [Email]
 *     description: Send a QR code authentication email with embedded QR code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRAuthEmailRequest'
 *     responses:
 *       200:
 *         description: QR authentication email sent successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/qr-auth', (0, validation_1.validateRequest)(qrAuthEmailSchema), email_controller_1.EmailController.sendQRAuthEmail);
/**
 * @swagger
 * /api/email/bulk:
 *   post:
 *     summary: Send bulk emails
 *     tags: [Email]
 *     description: Send multiple emails in batch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkEmailRequest'
 *     responses:
 *       200:
 *         description: Bulk emails sent successfully
 *       400:
 *         description: Bad request - Invalid emails array
 *       500:
 *         description: Internal server error
 */
router.post('/bulk', (0, validation_1.validateRequest)(bulkEmailSchema), email_controller_1.EmailController.sendBulkEmails);
exports.default = router;
