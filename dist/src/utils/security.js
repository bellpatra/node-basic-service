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
exports.PasswordValidator = exports.SecurityUtils = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("./logger");
/**
 * Utility class for password hashing, token generation/verification, and user sanitization.
 */
class SecurityUtils {
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            return bcryptjs_1.default.hash(password, salt);
        });
    }
    static comparePasswords(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(plainPassword, hashedPassword);
        });
    }
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn
        });
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        }
        catch (error) {
            logger_1.Logger.error('Token verification failed', error);
            throw error;
        }
    }
    static extractTokenFromHeader(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.split(' ')[1];
    }
    static generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, config_1.config.jwt.refreshSecret, {
            expiresIn: config_1.config.jwt.refreshExpiresIn
        });
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
        }
        catch (error) {
            logger_1.Logger.error('Refresh token verification failed', error);
            throw error;
        }
    }
    static sanitizeUser(user) {
        const { password } = user, sanitizedUser = __rest(user, ["password"]);
        return sanitizedUser;
    }
}
exports.SecurityUtils = SecurityUtils;
/**
 * Utility class for validating password strength.
 */
class PasswordValidator {
    static validate(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (password.length < minLength) {
            return {
                isValid: false,
                message: `Password must be at least ${minLength} characters long`
            };
        }
        if (!hasUpperCase || !hasLowerCase) {
            return {
                isValid: false,
                message: 'Password must contain both uppercase and lowercase letters'
            };
        }
        if (!hasNumbers) {
            return {
                isValid: false,
                message: 'Password must contain at least one number'
            };
        }
        if (!hasSpecialChar) {
            return {
                isValid: false,
                message: 'Password must contain at least one special character'
            };
        }
        return { isValid: true, message: 'Password is valid' };
    }
}
exports.PasswordValidator = PasswordValidator;
