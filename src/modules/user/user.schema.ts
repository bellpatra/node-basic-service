import { z } from 'zod';
import { PasswordValidator } from '../../utils/security';

// Base user schema
const userBaseSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (password) => {
        const validation = PasswordValidator.validate(password);
        return validation.isValid;
      },
      {
        message: 'Password must contain uppercase, lowercase, number, and special character'
      }
    )
});

// User creation schema (registration)
export const userCreateSchema = userBaseSchema.extend({
  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  role: z.enum(['user', 'admin']).default('user')
});

// User login schema
export const userLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

// Password reset confirmation schema
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: userBaseSchema.shape.password
});

// User update schema
export const userUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters')
    .optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must also be provided
    return !(data.newPassword && !data.currentPassword);
  },
  {
    message: 'Current password is required when setting a new password',
    path: ['currentPassword']
  }
);

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Type inference
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;