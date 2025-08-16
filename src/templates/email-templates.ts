import Handlebars from 'handlebars';

// Welcome Email Template
export const welcomeEmailTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{appName}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 2.5rem; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; }
        .content { padding: 40px; }
        .welcome-text { font-size: 1.2rem; color: #333; line-height: 1.6; margin-bottom: 30px; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
        .feature-icon { font-size: 2rem; margin-bottom: 10px; }
        .cta-button { display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer a { color: #667eea; text-decoration: none; }
        @media (max-width: 600px) { .features { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome!</h1>
            <p>You're now part of the {{appName}} family</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                <p>Hi <strong>{{username}}</strong>,</p>
                <p>Welcome to {{appName}}! We're thrilled to have you on board. Your account has been successfully created and you're all set to explore our amazing features.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🔐</div>
                    <h3>Secure Authentication</h3>
                    <p>Advanced security with JWT tokens and QR code login</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h3>QR Code Login</h3>
                    <p>WhatsApp-style QR authentication for mobile users</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h3>High Performance</h3>
                    <p>Built with Node.js and TypeScript for speed</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🛡️</div>
                    <h3>Enterprise Security</h3>
                    <p>Production-ready security measures</p>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{loginUrl}}" class="cta-button">🚀 Get Started</a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3>📋 Account Details</h3>
                <p><strong>Username:</strong> {{username}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Account Created:</strong> {{createdAt}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 {{appName}}. All rights reserved.</p>
            <p>Need help? <a href="{{supportUrl}}">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
`);

// Password Reset Template
export const passwordResetTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 2.5rem; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; }
        .content { padding: 40px; }
        .reset-text { font-size: 1.2rem; color: #333; line-height: 1.6; margin-bottom: 30px; }
        .reset-button { display: inline-block; background: linear-gradient(45deg, #e53e3e, #c53030); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fed7d7; border: 1px solid #feb2b2; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .warning h3 { color: #c53030; margin-top: 0; }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer a { color: #e53e3e; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset</h1>
            <p>Secure your account</p>
        </div>
        
        <div class="content">
            <div class="reset-text">
                <p>Hi <strong>{{username}}</strong>,</p>
                <p>We received a request to reset your password for your {{appName}} account. If you didn't make this request, you can safely ignore this email.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{resetUrl}}" class="reset-button">🔄 Reset Password</a>
            </div>
            
            <div class="warning">
                <h3>⚠️ Security Notice</h3>
                <p>This password reset link will expire in <strong>{{expiryTime}}</strong>. For security reasons, please reset your password immediately.</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3>📋 Reset Details</h3>
                <p><strong>Username:</strong> {{username}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Request Time:</strong> {{requestTime}}</p>
                <p><strong>Expires:</strong> {{expiryTime}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 {{appName}}. All rights reserved.</p>
            <p>Need help? <a href="{{supportUrl}}">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
`);

// QR Code Authentication Template
export const qrAuthTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Authentication</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 2.5rem; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; }
        .content { padding: 40px; }
        .qr-text { font-size: 1.2rem; color: #333; line-height: 1.6; margin-bottom: 30px; }
        .qr-code { text-align: center; margin: 30px 0; }
        .qr-code img { max-width: 200px; border: 2px solid #ddd; border-radius: 10px; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer a { color: #25d366; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 QR Authentication</h1>
            <p>Secure mobile login</p>
        </div>
        
        <div class="content">
            <div class="qr-text">
                <p>Hi <strong>{{username}}</strong>,</p>
                <p>Here's your QR code for secure authentication. Scan this code with your mobile app to log in automatically.</p>
            </div>
            
            <div class="qr-code">
                <img src="{{qrCodeUrl}}" alt="QR Code for Authentication" />
                <p><strong>QR Code ID:</strong> {{qrCodeId}}</p>
            </div>
            
            <div class="info-box">
                <h3>📋 Authentication Details</h3>
                <p><strong>Username:</strong> {{username}}</p>
                <p><strong>Generated:</strong> {{generatedAt}}</p>
                <p><strong>Expires:</strong> {{expiresAt}}</p>
                <p><strong>Type:</strong> {{qrCodeType}}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #e6fffa; border: 1px solid #81e6d9; border-radius: 10px;">
                <h3>💡 How to Use</h3>
                <ol style="color: #333;">
                    <li>Open your mobile app</li>
                    <li>Go to QR Scanner</li>
                    <li>Point camera at this QR code</li>
                    <li>You'll be automatically logged in</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 {{appName}}. All rights reserved.</p>
            <p>Need help? <a href="{{supportUrl}}">Contact Support</a></p>
        </div>
    </div>
</html>
`);

// Account Verification Template
export const accountVerificationTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 2.5rem; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; }
        .content { padding: 40px; }
        .verify-text { font-size: 1.2rem; color: #333; line-height: 1.6; margin-bottom: 30px; }
        .verify-button { display: inline-block; background: linear-gradient(45deg, #38a169, #2f855a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer a { color: #38a169; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Verify Account</h1>
            <p>Complete your registration</p>
        </div>
        
        <div class="content">
            <div class="verify-text">
                <p>Hi <strong>{{username}}</strong>,</p>
                <p>Thank you for registering with {{appName}}! To complete your registration and activate your account, please click the verification button below.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{verificationUrl}}" class="verify-button">✅ Verify Account</a>
            </div>
            
            <div class="info-box">
                <h3>📋 Account Details</h3>
                <p><strong>Username:</strong> {{username}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Registration Date:</strong> {{registrationDate}}</p>
                <p><strong>Verification Expires:</strong> {{expiryDate}}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 10px;">
                <h3>🎯 What Happens Next?</h3>
                <ul style="color: #333;">
                    <li>Your account will be fully activated</li>
                    <li>You can access all features</li>
                    <li>Set up your profile and preferences</li>
                    <li>Start using our services</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 {{appName}}. All rights reserved.</p>
            <p>Need help? <a href="{{supportUrl}}">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
`);

// Notification Template
export const notificationTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{notificationTitle}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 2.5rem; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; }
        .content { padding: 40px; }
        .notification-text { font-size: 1.2rem; color: #333; line-height: 1.6; margin-bottom: 30px; }
        .action-button { display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer a { color: #667eea; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{notificationIcon}} {{notificationTitle}}</h1>
            <p>{{notificationSubtitle}}</p>
        </div>
        
        <div class="content">
            <div class="notification-text">
                <p>Hi <strong>{{username}}</strong>,</p>
                <p>{{notificationMessage}}</p>
            </div>
            
            {{#if actionUrl}}
            <div style="text-align: center;">
                <a href="{{actionUrl}}" class="action-button">{{actionButtonText}}</a>
            </div>
            {{/if}}
            
            <div class="info-box">
                <h3>📋 Notification Details</h3>
                <p><strong>Type:</strong> {{notificationType}}</p>
                <p><strong>Time:</strong> {{notificationTime}}</p>
                {{#if additionalInfo}}
                <p><strong>Additional Info:</strong> {{additionalInfo}}</p>
                {{/if}}
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 {{appName}}. All rights reserved.</p>
            <p>Need help? <a href="{{supportUrl}}">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
`);
