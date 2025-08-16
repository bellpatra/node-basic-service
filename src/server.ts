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
      socket.emit('qr-error', { error: 'Failed to generate QR code' });
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

// Generate session QR code (temporary, for demo purposes)
async function generateSessionQRCode() {
  const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return {
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    sessionId: Date.now().toString()
  };
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 WebSocket server ready for real-time QR authentication`);
});

// Export for use in other modules
export { io };