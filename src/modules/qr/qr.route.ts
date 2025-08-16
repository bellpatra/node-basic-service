import { Router } from 'express';
import { QRController } from './qr.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     QRCodeGenerate:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [API, EXPLANATION, MAGIC_LINK]
 *           description: Type of QR code to generate
 *         customData:
 *           type: object
 *           description: Custom data for the QR code
 *         expiryMinutes:
 *           type: integer
 *           default: 5
 *           description: Minutes until QR code expires
 *         maxUsage:
 *           type: integer
 *           description: Maximum number of times QR code can be used
 *     
 *     QRCodeVerify:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           description: QR code to verify
 *         qrData:
 *           type: object
 *           description: Additional data for verification
 *     
 *     QRCode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           description: Unique QR code identifier
 *         type:
 *           type: string
 *           enum: [API, EXPLANATION, MAGIC_LINK]
 *         data:
 *           type: object
 *           description: QR code data payload
 *         metadata:
 *           type: object
 *           description: Additional metadata
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         usageCount:
 *           type: integer
 *         maxUsage:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/qr/generate:
 *   post:
 *     summary: Generate new QR code
 *     tags: [QR Authentication]
 *     description: Generate a new QR code for authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRCodeGenerate'
 *           example:
 *             type: "EXPLANATION"
 *             customData:
 *               explanation: "Scan this QR code to access your account"
 *               action: "login"
 *             expiryMinutes: 10
 *             maxUsage: 5
 *     responses:
 *       201:
 *         description: QR code generated successfully
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "QR code generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       $ref: '#/components/schemas/QRCode'
 *                     qrImage:
 *                       type: string
 *                       description: Base64 encoded QR code image
 *       400:
 *         description: Invalid QR code type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/generate', authMiddleware, QRController.generateQRCode);

/**
 * @swagger
 * /api/qr/verify:
 *   post:
 *     summary: Verify QR code
 *     tags: [QR Authentication]
 *     description: Verify a QR code and authenticate the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRCodeVerify'
 *           example:
 *             code: "uuid-here"
 *             qrData:
 *               device: "mobile"
 *     responses:
 *       200:
 *         description: QR authentication successful
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
 *                   example: "QR authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Authenticated user information
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                     method:
 *                       type: string
 *                       description: Authentication method used
 *       400:
 *         description: Invalid or expired QR code
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify', QRController.verifyQRCode);

/**
 * @swagger
 * /api/qr/stats:
 *   get:
 *     summary: Get QR statistics
 *     tags: [QR Authentication]
 *     description: Get QR code usage statistics (admin/moderator only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                   example: "QR statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalGenerated:
 *                       type: integer
 *                       description: Total QR codes generated
 *                     successfulLogins:
 *                       type: integer
 *                       description: Successful QR verifications
 *                     failedAttempts:
 *                       type: integer
 *                       description: Failed verification attempts
 *                     recentCodes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QRCode'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authMiddleware, QRController.getQRStats);

/**
 * @swagger
 * /api/qr/my-codes:
 *   get:
 *     summary: Get user's QR codes
 *     tags: [QR Authentication]
 *     description: Get all QR codes generated by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User QR codes retrieved successfully
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
 *                   example: "User QR codes retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCodes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QRCode'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-codes', authMiddleware, QRController.getUserQRCodes);

/**
 * @swagger
 * /api/qr/{code}:
 *   delete:
 *     summary: Deactivate QR code
 *     tags: [QR Authentication]
 *     description: Deactivate a QR code (only the owner can deactivate)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: QR code to deactivate
 *     responses:
 *       200:
 *         description: QR code deactivated successfully
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
 *                   example: "QR code deactivated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "QR code deactivated successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to deactivate this QR code
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:code', authMiddleware, QRController.deactivateQRCode);

/**
 * @swagger
 * /api/qr/session:
 *   get:
 *     summary: Get session QR code for frontend display
 *     tags: [QR Authentication]
 *     description: Generate a session QR code that auto-refreshes and supports real-time authentication
 *     responses:
 *       200:
 *         description: Session QR code generated successfully
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
 *                   example: "Session QR code generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       description: Unique session identifier
 *                     qrCode:
 *                       type: string
 *                       description: Base64 encoded QR code image
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the QR code expires
 *       500:
 *         description: Internal server error
 */
router.get('/session', QRController.generateSessionQRCode);

/**
 * @swagger
 * /api/qr/verify-session:
 *   post:
 *     summary: Verify session QR code for auto-login
 *     tags: [QR Authentication]
 *     description: Verify a session QR code and automatically log in the user (like WhatsApp Web)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - userId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session identifier from QR code
 *               userId:
 *                 type: string
 *                 description: User ID to authenticate
 *     responses:
 *       200:
 *         description: Session verified and user logged in
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
 *                   example: "Session verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Authenticated user information
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *       400:
 *         description: Invalid session or user
 *       500:
 *         description: Internal server error
 */
router.post('/verify-session', QRController.verifySessionQRCode);

export default router;
