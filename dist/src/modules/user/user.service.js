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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const security_1 = require("../../utils/security");
const cache_1 = require("../../utils/cache");
const logger_1 = require("../../utils/logger");
const user_producer_1 = require("../../events/producers/user.producer");
const crypto_1 = require("crypto");
const user_event_1 = require("./user.event");
// Cache keys
const USER_CACHE_KEY = 'user:';
const USER_TOKEN_CACHE_KEY = 'user:token:';
const PASSWORD_RESET_CACHE_KEY = 'password:reset:';
class UserService {
    /**
     * Creates a new user in the database after checking for duplicates, hashes the password,
     * caches the user, and emits user created events.
     */
    static createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Build OR conditions for uniqueness check
            const orConditions = [
                { username: userData.username },
                { email: userData.email }
            ];
            // Add phone to uniqueness check if provided
            if (userData.phone) {
                orConditions.push({ phone: userData.phone });
            }
            // Check if username, email, or phone already exists
            const existingUser = yield prisma_1.default.user.findFirst({
                where: {
                    OR: orConditions
                }
            });
            if (existingUser) {
                if (existingUser.username === userData.username) {
                    throw new Error('Username already taken');
                }
                else if (existingUser.email === userData.email) {
                    throw new Error('Email already registered');
                }
                else if (existingUser.phone === userData.phone) {
                    throw new Error('Phone number already registered');
                }
            }
            // Hash password
            const hashedPassword = yield security_1.SecurityUtils.hashPassword(userData.password);
            // Create user
            const user = yield prisma_1.default.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone,
                    password: hashedPassword,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    fullName: userData.fullName,
                    isActive: true
                }
            });
            // Remove password from response
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            // Cache user data
            yield cache_1.CacheService.set(`${USER_CACHE_KEY}${user.id}`, userWithoutPassword, 3600);
            // Emit user created event
            try {
                yield user_event_1.UserEvents.emitUserCreated(userWithoutPassword);
                yield user_producer_1.UserEventProducer.userCreated(userWithoutPassword);
            }
            catch (error) {
                logger_1.Logger.error('Failed to emit user created event', error);
            }
            return userWithoutPassword;
        });
    }
    /**
     * Authenticates a user by username/email/phone and password, updates last login,
     * generates tokens, caches refresh token, and emits login events.
     */
    static login(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { identifier, password } = loginData;
            // Find user by username, email, or phone
            const user = yield prisma_1.default.user.findFirst({
                where: {
                    OR: [
                        { username: identifier },
                        { email: identifier },
                        { phone: identifier }
                    ]
                }
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }
            // Verify password
            const isValidPassword = yield security_1.SecurityUtils.comparePasswords(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }
            // Update last login
            yield prisma_1.default.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
            });
            // Generate tokens
            const { accessToken, refreshToken } = this.generateAuthTokens(user);
            // Save token to database
            yield prisma_1.default.user.update({
                where: { id: user.id },
                data: { token: accessToken }
            });
            // Cache refresh token
            yield cache_1.CacheService.set(`${USER_TOKEN_CACHE_KEY}${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days
            // Remove password from response
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            // Emit login event
            try {
                const metadata = {
                    ip: '', // Will be set in controller
                    userAgent: '' // Will be set in controller
                };
                yield user_event_1.UserEvents.emitUserLogin(user.id, metadata);
                yield user_producer_1.UserEventProducer.userAuthenticated(user.id, metadata);
            }
            catch (error) {
                logger_1.Logger.error('Failed to emit user login event', error);
            }
            return {
                token: accessToken,
                refreshToken,
                user: userWithoutPassword
            };
        });
    }
    /**
     * Validates and refreshes the access and refresh tokens for a user.
     */
    static refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify refresh token
                const payload = security_1.SecurityUtils.verifyRefreshToken(refreshToken);
                const { userId } = payload;
                // Get cached refresh token
                const cachedToken = yield cache_1.CacheService.get(`${USER_TOKEN_CACHE_KEY}${userId}`);
                if (!cachedToken || cachedToken !== refreshToken) {
                    throw new Error('Invalid refresh token');
                }
                // Get user
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId }
                });
                if (!user || !user.isActive) {
                    throw new Error('User not found or inactive');
                }
                // Generate new tokens
                const tokens = this.generateAuthTokens(user);
                // Save new token to database
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: { token: tokens.accessToken }
                });
                // Update cached refresh token
                yield cache_1.CacheService.set(`${USER_TOKEN_CACHE_KEY}${userId}`, tokens.refreshToken, 30 * 24 * 60 * 60);
                return tokens;
            }
            catch (error) {
                throw new Error('Invalid refresh token');
            }
        });
    }
    /**
     * Retrieves a user by ID, first checking the cache, then the database.
     */
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try to get from cache first
            const cachedUser = yield cache_1.CacheService.get(`${USER_CACHE_KEY}${id}`);
            if (cachedUser) {
                return cachedUser;
            }
            // Get from database
            const user = yield prisma_1.default.user.findUnique({
                where: { id }
            });
            if (!user)
                return null;
            // Remove password
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            yield cache_1.CacheService.set(`${USER_CACHE_KEY}${id}`, userWithoutPassword, 3600);
            return userWithoutPassword;
        });
    }
    /**
     * Updates user profile information, including password change with validation,
     * and emits password changed event if applicable.
     */
    static updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get current user
            const currentUser = yield prisma_1.default.user.findUnique({
                where: { id: userId }
            });
            if (!currentUser) {
                throw new Error('User not found');
            }
            // If changing password, verify current password
            if (updateData.newPassword) {
                if (!updateData.currentPassword) {
                    throw new Error('Current password is required');
                }
                const isValidPassword = yield security_1.SecurityUtils.comparePasswords(updateData.currentPassword, currentUser.password);
                if (!isValidPassword) {
                    throw new Error('Current password is incorrect');
                }
            }
            // Prepare update data
            const updateFields = {};
            if (updateData.fullName)
                updateFields.fullName = updateData.fullName;
            if (updateData.email)
                updateFields.email = updateData.email;
            if (updateData.phone)
                updateFields.phone = updateData.phone;
            if (updateData.newPassword) {
                updateFields.password = yield security_1.SecurityUtils.hashPassword(updateData.newPassword);
                // Emit password changed event
                try {
                    yield user_producer_1.UserEventProducer.userPasswordChanged(userId);
                }
                catch (error) {
                    logger_1.Logger.error('Failed to emit password changed event', error);
                }
            }
            // Update user
            const updatedUser = yield prisma_1.default.user.update({
                where: { id: userId },
                data: updateFields
            });
            // Remove password from response
            const { password: _ } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
            // Update cache
            yield cache_1.CacheService.set(`${USER_CACHE_KEY}${userId}`, userWithoutPassword, 3600);
            return userWithoutPassword;
        });
    }
    /**
     * Initiates a password reset process by generating a reset token and sending an email.
     */
    static requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user by email
            const user = yield prisma_1.default.user.findFirst({
                where: { email }
            });
            if (!user) {
                // Don't reveal if email exists or not for security
                return;
            }
            // Generate reset token
            const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
            // Store token in Redis with expiration (15 minutes)
            yield cache_1.CacheService.set(`${PASSWORD_RESET_CACHE_KEY}${resetToken}`, user.id, 15 * 60);
            // In a real application, send email with reset link
            logger_1.Logger.info(`Password reset requested for ${email}. Token: ${resetToken}`);
        });
    }
    /**
     * Resets the user's password using a valid reset token and new password.
     */
    static resetPassword(resetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, password } = resetData;
            // Get user ID from token
            const userId = yield cache_1.CacheService.get(`${PASSWORD_RESET_CACHE_KEY}${token}`);
            if (!userId) {
                throw new Error('Invalid or expired reset token');
            }
            // Hash new password
            const hashedPassword = yield security_1.SecurityUtils.hashPassword(password);
            // Update password
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
            // Delete token
            yield cache_1.CacheService.del(`${PASSWORD_RESET_CACHE_KEY}${token}`);
            // Clear token from database and invalidate user tokens
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { token: null }
            });
            yield cache_1.CacheService.del(`${USER_TOKEN_CACHE_KEY}${userId}`);
            // Emit password changed event
            try {
                yield user_producer_1.UserEventProducer.userPasswordChanged(userId);
            }
            catch (error) {
                logger_1.Logger.error('Failed to emit password changed event', error);
            }
        });
    }
    /**
     * Logs out a user by clearing their tokens.
     */
    static logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Clear token from database
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { token: null }
            });
            // Clear cached refresh token
            yield cache_1.CacheService.del(`${USER_TOKEN_CACHE_KEY}${userId}`);
        });
    }
    /**
     * Generates access and refresh tokens for a user.
     */
    static generateAuthTokens(user) {
        const accessToken = security_1.SecurityUtils.generateToken({
            userId: user.id,
            username: user.username
        });
        const refreshToken = security_1.SecurityUtils.generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken
        };
    }
}
exports.UserService = UserService;
