import app from './app';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  Logger.info(`Client connected: ${socket.id}`);
  
  // Handle QR code generation requests
  socket.on('generate-qr', async (data) => {
    try {
      // Generate a new QR code for the session
      const qrCode = await generateSessionQRCode();
      socket.emit('qr-generated', { qrCode });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      Logger.error('WebSocket QR generation failed', new Error(errorMessage), { socketId: socket.id });
      socket.emit('qr-error', { error: errorMessage });
    }
  });

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
    Logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Generate session QR code directly using QRCode library
async function generateSessionQRCode() {
  try {
    // Import QRCode library directly
    const QRCode = await import('qrcode');
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Generate a simple session QR code
    const qrData = {
      sessionId,
      endpoint: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/qr/verify-session`,
      timestamp: new Date().toISOString()
    };

    // Generate QR code image
    const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

    // Set expiry to 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    Logger.info('WebSocket generated QR code successfully', { sessionId });
    
    return {
      code: sessionId,
      qrCode: qrImage,
      expiresAt: expiresAt.toISOString(),
      sessionId: sessionId
    };
  } catch (error) {
    Logger.error('Error generating session QR code:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 WebSocket server ready for real-time QR authentication`);
});

// Export for use in other modules
export { io };