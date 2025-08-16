"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.io = void 0;
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const logger_1 = require("./utils/logger");
const PORT = process.env.PORT || 3000;
// Create HTTP server
const server = (0, http_1.createServer)(app_1.default);
// Create Socket.IO server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
// Socket.IO connection handling
io.on('connection', (socket) => {
    logger_1.Logger.info(`Client connected: ${socket.id}`);
    // Handle QR code generation requests
    socket.on('generate-qr', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Generate a new QR code for the session
            const qrCode = yield generateSessionQRCode();
            socket.emit('qr-generated', { qrCode });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
            logger_1.Logger.error('WebSocket QR generation failed', new Error(errorMessage), { socketId: socket.id });
            socket.emit('qr-error', { error: errorMessage });
        }
    }));
    // Handle QR code verification
    socket.on('qr-verified', (data) => {
        // Notify all clients that QR was verified
        io.emit('qr-authenticated', {
            userId: data.userId,
            username: data.username,
            timestamp: new Date().toISOString()
        });
    });
    socket.on('disconnect', () => {
        logger_1.Logger.info(`Client disconnected: ${socket.id}`);
    });
});
// Generate session QR code directly using QRCode library
function generateSessionQRCode() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Import QRCode library directly
            const QRCode = yield Promise.resolve().then(() => __importStar(require('qrcode')));
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            // Generate a simple session QR code
            const qrData = {
                sessionId,
                endpoint: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/qr/verify-session`,
                timestamp: new Date().toISOString()
            };
            // Generate QR code image
            const qrImage = yield QRCode.toDataURL(JSON.stringify(qrData));
            // Set expiry to 5 minutes
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            logger_1.Logger.info('WebSocket generated QR code successfully', { sessionId });
            return {
                code: sessionId,
                qrCode: qrImage,
                expiresAt: expiresAt.toISOString(),
                sessionId: sessionId
            };
        }
        catch (error) {
            logger_1.Logger.error('Error generating session QR code:', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    });
}
// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 WebSocket server ready for real-time QR authentication`);
});
