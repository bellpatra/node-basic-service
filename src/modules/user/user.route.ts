import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../utils/validation';
import {
  userCreateSchema,
  userLoginSchema,
  userUpdateSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  refreshTokenSchema
} from './user.schema';

const router = Router();

// Auth routes
// Registers a new user
router.post('/register', validateRequest(userCreateSchema), UserController.register);
// Logs in a user
router.post('/login', validateRequest(userLoginSchema), UserController.login);
// Refreshes the access token using a refresh token
router.post('/refresh-token', validateRequest(refreshTokenSchema), UserController.refreshToken);
// Logs out the authenticated user
router.post('/logout', authMiddleware, UserController.logout);

// Password management
// Requests a password reset link
router.post('/password-reset', validateRequest(passwordResetRequestSchema), UserController.requestPasswordReset);
// Confirms password reset with a token
router.post('/password-reset/confirm', validateRequest(passwordResetConfirmSchema), UserController.resetPassword);

// User profile management
// Retrieves the authenticated user's profile
router.get('/profile', authMiddleware, UserController.getProfile);
// Updates the authenticated user's profile
router.patch('/profile', authMiddleware, validateRequest(userUpdateSchema), UserController.updateProfile);

export default router;