"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailTransporter = exports.emailProviders = exports.emailConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.emailConfig = {
    provider: process.env.EMAIL_PROVIDER || 'mailtrap',
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
    },
    apiKey: process.env.EMAIL_API_KEY,
    domain: process.env.EMAIL_DOMAIN,
};
// Provider-specific configurations
exports.emailProviders = {
    mailgun: {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
    },
    sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
    },
    mailtrap: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        secure: false,
    },
    smtp: {
        host: process.env.EMAIL_HOST || 'localhost',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
    },
};
const getEmailTransporter = () => {
    const provider = exports.emailProviders[exports.emailConfig.provider];
    return nodemailer_1.default.createTransport({
        host: provider.host,
        port: provider.port,
        secure: provider.secure,
        auth: {
            user: exports.emailConfig.auth.user,
            pass: exports.emailConfig.auth.pass,
        },
    });
};
exports.getEmailTransporter = getEmailTransporter;
