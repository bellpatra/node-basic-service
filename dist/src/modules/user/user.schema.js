"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.userUpdateSchema = exports.passwordResetConfirmSchema = exports.passwordResetRequestSchema = exports.userLoginSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
const security_1 = require("../../utils/security");
// Base user schema
const userBaseSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine((password) => {
        const validation = security_1.PasswordValidator.validate(password);
        return validation.isValid;
    }, {
        message: 'Password must contain uppercase, lowercase, number, and special character'
    })
});
// User creation schema (registration)
exports.userCreateSchema = userBaseSchema.extend({
    email: zod_1.z
        .string()
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters'),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
        .optional(),
    fullName: zod_1.z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters')
        .optional(),
    role: zod_1.z.enum(['user', 'admin']).default('user')
});
// User login schema - supports username, email, or phone
exports.userLoginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'Username, email, or phone is required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
// Password reset request schema
exports.passwordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format')
});
// Password reset confirmation schema
exports.passwordResetConfirmSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password: userBaseSchema.shape.password
});
// User update schema
exports.userUpdateSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters')
        .optional(),
    email: zod_1.z
        .string()
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
        .optional(),
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z.string().optional(),
}).refine((data) => {
    // If newPassword is provided, currentPassword must also be provided
    return !(data.newPassword && !data.currentPassword);
}, {
    message: 'Current password is required when setting a new password',
    path: ['currentPassword']
});
// Refresh token schema
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
