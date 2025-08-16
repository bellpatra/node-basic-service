import nodemailer from 'nodemailer';

export interface EmailConfig {
  provider: 'mailgun' | 'sendgrid' | 'mailtrap' | 'smtp';
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  apiKey?: string;
  domain?: string;
}

export const emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailConfig['provider']) || 'mailtrap',
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
export const emailProviders = {
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

export const getEmailTransporter = () => {
  const provider = emailProviders[emailConfig.provider];

  return nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass,
    },
  });
};
