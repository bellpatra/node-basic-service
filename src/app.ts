import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requestLogger, errorLogger } from './utils/logger';
import userRoutes from './modules/user/user.route';
import { errorMiddleware } from './middlewares/error.middleware';
import { ApiResponse } from './utils/validation';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true // Allow cookies with CORS
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(requestLogger);

// Routes
app.use('/api/users', userRoutes);

// Error handling
app.use(errorLogger);
app.use(errorMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  const response = ApiResponse.success(
    { 
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    },
    'Service is healthy',
    200
  );
  return ApiResponse.send(res, response);
});

export default app;