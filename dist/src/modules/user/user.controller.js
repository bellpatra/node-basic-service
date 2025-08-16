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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const validation_1 = require("../../utils/validation");
class UserController {
    /**
     * Handles user registration by delegating to the service and returns the created user.
     */
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                const user = yield user_service_1.UserService.createUser(req.body);
                return user;
            }), 'User registered successfully');
        });
    }
    /**
     * Handles user login, sets refresh token cookie, and returns authentication response.
     */
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                // Add IP and user agent to metadata for event tracking
                const authResponse = yield user_service_1.UserService.login(req.body);
                // Set refresh token as HTTP-only cookie for better security
                res.cookie('refreshToken', authResponse.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    path: '/api/auth/refresh'
                });
                return authResponse;
            }), 'Login successful');
        });
    }
    /**
     * Retrieves the authenticated user's profile information.
     */
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new Error('Unauthorized');
                }
                const user = yield user_service_1.UserService.getUserById(userId);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            }), 'Profile retrieved successfully');
        });
    }
    /**
     * Updates the authenticated user's profile information.
     */
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new Error('Unauthorized');
                }
                const updatedUser = yield user_service_1.UserService.updateUser(userId, req.body);
                return updatedUser;
            }), 'Profile updated successfully');
        });
    }
    /**
     * Handles refresh token logic and returns a new access token.
     */
    static refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Get refresh token from cookie or request body
                const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
                if (!refreshToken) {
                    throw new Error('Refresh token is required');
                }
                const tokens = yield user_service_1.UserService.refreshToken(refreshToken);
                // Update refresh token cookie
                res.cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    path: '/api/auth/refresh'
                });
                return { accessToken: tokens.accessToken };
            }), 'Token refreshed successfully');
        });
    }
    /**
     * Initiates a password reset process for the given email address.
     */
    static requestPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                yield user_service_1.UserService.requestPasswordReset(req.body.email);
                return { message: 'If your email is registered, you will receive a password reset link' };
            }), 'Password reset requested');
        });
    }
    /**
     * Resets the user's password using a provided reset token and new password.
     */
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                yield user_service_1.UserService.resetPassword(req.body);
                return { message: 'Password has been reset successfully' };
            }), 'Password reset successful');
        });
    }
    /**
     * Logs out the user by clearing the refresh token cookie.
     */
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                // Clear refresh token cookie
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/api/auth/refresh'
                });
                return { message: 'Logged out successfully' };
            }), 'Logout successful');
        });
    }
}
exports.UserController = UserController;
