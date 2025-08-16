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
            socket.emit('qr-error', { error: 'Failed to generate QR code' });
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
// Generate session QR code (temporary, for demo purposes)
function generateSessionQRCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return {
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            sessionId: Date.now().toString()
        };
    });
}
// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 WebSocket server ready for real-time QR authentication`);
});
