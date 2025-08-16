import nodemailer from 'nodemailer';
import { getEmailTransporter, emailConfig } from '../config/email';
import {
  welcomeEmailTemplate,
  passwordResetTemplate,
  qrAuthTemplate,
  accountVerificationTemplate,
  notificationTemplate,
} from '../templates/email-templates';
import { Logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface WelcomeEmailData {
  username: string;
  email: string;
  appName: string;
  loginUrl: string;
  supportUrl: string;
  createdAt: string;
}

export interface PasswordResetEmailData {
  username: string;
  email: string;
  appName: string;
  resetUrl: string;
  supportUrl: string;
  requestTime: string;
  expiryTime: string;
}

export interface QRAuthEmailData {
  username: string;
  email: string;
  qrCodeUrl: string;
  qrCodeId: string;
  appName: string;
  supportUrl: string;
  generatedAt: string;
  expiresAt: string;
  qrCodeType: string;
}

export interface AccountVerificationEmailData {
  username: string;
  email: string;
  appName: string;
  verificationUrl: string;
  supportUrl: string;
  registrationDate: string;
  expiryDate: string;
}

export interface NotificationEmailData {
  username: string;
  email: string;
  notificationTitle: string;
  notificationSubtitle: string;
  notificationMessage: string;
  notificationIcon: string;
  notificationType: string;
  notificationTime: string;
  appName: string;
  supportUrl: string;
  actionUrl?: string;
  actionButtonText?: string;
  additionalInfo?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    this.transporter = getEmailTransporter();
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      Logger.info(`Email sent successfully to ${options.to}`, {
        messageId: result.messageId,
        subject: options.subject,
      });
      return true;
    } catch (error) {
      Logger.error('Failed to send email', error as Error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = welcomeEmailTemplate(data);
    return this.sendEmail({
      to: data.email,
      subject: `🎉 Welcome to ${data.appName}!`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const html = passwordResetTemplate(data);
    return this.sendEmail({
      to: data.email,
      subject: `🔒 Reset Your ${data.appName} Password`,
      html,
    });
  }

  /**
   * Send QR authentication email
   */
  async sendQRAuthEmail(data: QRAuthEmailData): Promise<boolean> {
    const html = qrAuthTemplate(data);
    return this.sendEmail({
      to: data.email,
      subject: `📱 QR Code Authentication - ${data.appName}`,
      html,
    });
  }

  /**
   * Send account verification email
   */
  async sendAccountVerificationEmail(data: AccountVerificationEmailData): Promise<boolean> {
    const html = accountVerificationTemplate(data);
    return this.sendEmail({
      to: data.email,
      subject: `✅ Verify Your ${data.appName} Account`,
      html,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(data: NotificationEmailData): Promise<boolean> {
    const html = notificationTemplate(data);
    return this.sendEmail({
      to: data.email,
      subject: `${data.notificationIcon} ${data.notificationTitle}`,
      html,
    });
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    Logger.info(`Bulk email sending completed`, { success, failed });
    return { success, failed };
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      Logger.info('Email service connection verified successfully');
      return true;
    } catch (error) {
      Logger.error('Email service connection failed', error as Error);
      return false;
    }
  }

  /**
   * Get email service status
   */
  async getServiceStatus(): Promise<{
    connected: boolean;
    provider: string;
    host: string;
    port: number;
    secure: boolean;
  }> {
    const connected = await this.testConnection();
    return {
      connected,
      provider: emailConfig.provider,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
    };
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Update email configuration and recreate transporter
   */
  updateConfiguration(): void {
    this.transporter = getEmailTransporter();
    Logger.info('Email service configuration updated');
  }
}

// Export singleton instance
export const emailService = new EmailService();
