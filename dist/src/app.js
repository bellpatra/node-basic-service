"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_1 = require("./utils/logger");
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const qr_route_1 = __importDefault(require("./modules/qr/qr.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const validation_1 = require("./utils/validation");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true // Allow cookies with CORS
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Serve static files from public directory
app.use(express_1.default.static('src/public'));
// Logging
app.use(logger_1.requestLogger);
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node Basic Service API',
            version: '1.0.1',
            description: 'A robust, scalable authentication microservice built with Node.js, TypeScript, and modern best practices.',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'http://localhost:5001',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/modules/**/*.ts', './src/app.ts']
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Node Basic Service API Documentation',
    customfavIcon: '/favicon.ico'
}));
// Landing page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node Basic Service - Authentication API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            padding: 60px 0;
            color: white;
        }
        
        .header h1 {
            font-size: 3.5rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            font-size: 1.3rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 60px 0;
        }
        
        .feature-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.15);
        }
        
        .feature-card h3 {
            color: #667eea;
            font-size: 1.5rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .feature-card p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .icon {
            font-size: 2rem;
            color: #764ba2;
        }
        
        .api-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            margin: 60px 0;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .api-section h2 {
            color: #667eea;
            font-size: 2.5rem;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .endpoint {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        
        .endpoint h4 {
            color: #333;
            margin-bottom: 10px;
            font-size: 1.2rem;
        }
        
        .method {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .get { background: #61affe; color: white; }
        .post { background: #49cc90; color: white; }
        .put { background: #fca130; color: white; }
        .delete { background: #f93e3e; color: white; }
        
        .url {
            font-family: 'Courier New', monospace;
            background: #2d3748;
            color: #e2e8f0;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .tech-stack {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .tech-item {
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .tech-item h4 {
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            padding: 40px 0;
            color: white;
            opacity: 0.8;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            margin: 20px 10px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2.5rem; }
            .header p { font-size: 1.1rem; }
            .features { grid-template-columns: 1fr; }
            .tech-stack { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Node Basic Service</h1>
            <p>A robust, scalable authentication microservice built with Node.js, TypeScript, and modern best practices. 
               Designed for enterprise applications requiring secure user management and authentication.</p>
        </div>
        
        <div class="features">
            <div class="feature-card">
                <h3><span class="icon">🔐</span> Secure Authentication</h3>
                <p>JWT-based authentication with refresh tokens, password hashing, and secure session management. 
                   Built with bcrypt for password security and comprehensive validation.</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">📱</span> QR Code Authentication</h3>
                <p>Modern QR code-based authentication system with three types: API-based, Explanation-based, and Magic Link. 
                   Secure, fast, and user-friendly mobile authentication.</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">🔄</span> WhatsApp-Style Auto-Refresh</h3>
                <p>Real-time QR code authentication with auto-refresh every 5 seconds, WebSocket support, and instant login 
                   when QR codes are scanned - just like WhatsApp Web!</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">⚡</span> High Performance</h3>
                <p>Redis caching for improved response times, connection pooling, and optimized database queries. 
                   Built for scalability and high-traffic applications.</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">🛡️</span> Enterprise Security</h3>
                <p>Helmet security headers, CORS protection, input validation, and rate limiting. 
                   Production-ready security measures for enterprise deployments.</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">📊</span> Event-Driven Architecture</h3>
                <p>Kafka integration for asynchronous event processing, user activity tracking, and 
                   microservice communication. Real-time event streaming capabilities.</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">🗄️</span> Modern Database</h3>
                <p>PostgreSQL with Prisma ORM for type-safe database operations, migrations, and 
                   schema management. ACID compliance and advanced querying capabilities.</p>
            </div>
            
            <div class="feature-card">
                <h3><span class="icon">🔧</span> Developer Experience</h3>
                <p>TypeScript for type safety, comprehensive error handling, structured logging, 
                   and automated testing. Built with developer productivity in mind.</p>
            </div>
        </div>
        
        <div class="api-section">
            <h2>📚 API Documentation</h2>
            <p style="text-align: center; font-size: 1.2rem; color: #666; margin-bottom: 30px;">
                Explore our comprehensive API documentation with interactive testing capabilities
            </p>
            
            <div style="text-align: center; padding: 40px;">
                <a href="/api-docs" class="cta-button" style="font-size: 1.3rem; padding: 20px 40px; margin-bottom: 20px; display: inline-block;">
                    🚀 Open Swagger Documentation
                </a>
                
                <div style="margin-top: 30px;">
                    <a href="/qr-login" class="cta-button" style="font-size: 1.2rem; padding: 18px 35px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); border: none; margin: 0 10px;">
                        📱 Try WhatsApp-Style QR Login
                    </a>
                </div>
                
                <p style="margin-top: 20px; color: #666; font-size: 1rem;">
                    Test endpoints, view schemas, and explore the complete API reference
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 40px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; text-align: center;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">🔐 Authentication</h4>
                    <p style="color: #666; font-size: 0.9rem;">User registration, login, and token management</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; text-align: center;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">📱 QR Authentication</h4>
                    <p style="color: #666; font-size: 0.9rem;">Generate and verify QR codes for secure login</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; text-align: center;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">👤 User Management</h4>
                    <p style="color: #666; font-size: 0.9rem;">Profile updates and password management</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; text-align: center;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">📊 System Health</h4>
                    <p style="color: #666; font-size: 0.9rem;">Service monitoring and status checks</p>
                </div>
            </div>
        </div>
        
        <div class="tech-stack">
            <div class="tech-item">
                <h4>Backend</h4>
                <p>Node.js, TypeScript, Express</p>
            </div>
            <div class="tech-item">
                <h4>Database</h4>
                <p>PostgreSQL, Prisma ORM</p>
            </div>
            <div class="tech-item">
                <h4>Cache</h4>
                <p>Redis</p>
            </div>
            <div class="tech-item">
                <h4>Messaging</h4>
                <p>Apache Kafka</p>
            </div>
            <div class="tech-item">
                <h4>Security</h4>
                <p>JWT, bcrypt, Helmet</p>
            </div>
            <div class="tech-item">
                <h4>Validation</h4>
                <p>Zod, Express Validator</p>
            </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="/api-docs" class="cta-button" style="background: linear-gradient(45deg, #667eea, #764ba2); transform: scale(1.1);">🚀 Open Swagger Docs</a>
            <a href="/health" class="cta-button">🔍 Check API Health</a>
            <a href="/api/users/register" class="cta-button">📝 Test Registration</a>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Node Basic Service by bellpatra. Built with ❤️ for modern web applications.</p>
            <p>Version: v1.0.1 | Environment: ${process.env.NODE_ENV || 'development'}</p>
            <p style="margin-top: 20px;">
                <a href="/api-docs" style="color: white; text-decoration: none; padding: 10px 20px; border: 2px solid white; border-radius: 25px; transition: all 0.3s ease;">📚 View Full API Documentation</a>
            </p>
        </div>
    </div>
</body>
</html>
  `);
});
// Routes
app.use('/api/users', user_route_1.default);
app.use('/api/qr', qr_route_1.default);
// WhatsApp-like QR Login Page
app.get('/qr-login', (req, res) => {
    // Add cache-busting headers
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Code Login - Like WhatsApp Web</title>
        <link rel="stylesheet" href="/qr-login.css">
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
        <div class="qr-container">
            <div class="logo">📱</div>
            <h1 class="title">QR Code Login</h1>
            <p class="subtitle">Scan this QR code with your mobile app to log in automatically</p>
            
            <div class="qr-code" id="qrCodeContainer">
                <div class="qr-placeholder" id="qrPlaceholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,11h8V3H3V11z M5,5h4v4H5V5z"/>
                        <path d="M3,21h8v-8H3V21z M5,15h4v4H5V15z"/>
                        <path d="M13,3v8h8V3H13z M19,9h-4V5h4V9z"/>
                        <path d="M19,19h2v2h-2z"/>
                        <path d="M13,13h2v2h-2z"/>
                        <path d="M15,15h2v2h-2z"/>
                        <path d="M13,17h2v2h-2z"/>
                        <path d="M15,19h2v2h-2z"/>
                        <path d="M17,13h2v2h-2z"/>
                        <path d="M17,17h2v2h-2z"/>
                        <path d="M19,15h2v2h-2z"/>
                    </svg>
                    <span>QR Code will appear here...</span>
                </div>
                <img id="qrImage" src="" alt="QR Code" style="display: none;">
            </div>
            
            <div class="status waiting" id="status">
                <span class="loading"></span>
                Waiting for QR code scan...
            </div>
            
            <div class="refresh-info">
                QR code refreshes automatically every 5 seconds
            </div>
            
            <div class="manual-refresh">
                <button id="refreshBtn">Refresh QR Code Now</button>
            </div>
            
            <div class="user-info" id="userInfo">
                <div class="user-avatar" id="userAvatar">👤</div>
                <div class="user-name" id="userName"></div>
                <div class="user-email" id="userEmail"></div>
            </div>

            <div class="debug-info" id="debugInfo">
                <strong>Debug Information:</strong><br>
                Waiting for QR code generation...
            </div>
        </div>

        <script src="/qr-login.js"></script>
    </body>
    </html>
  `);
});
// Simple test endpoint for debugging
app.get('/qr-test', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>QR Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .test-container { max-width: 600px; margin: 0 auto; }
            .qr-display { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
            button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .error { color: red; }
            .success { color: green; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="test-container">
            <h1>QR Code Test</h1>
            <p>This page tests the QR code generation and display functionality.</p>
            
            <div>
                <button onclick="testQR()">Test QR Generation</button>
                <button onclick="testDirectQR()">Test Direct QR Display</button>
                <button onclick="clearResults()">Clear Results</button>
            </div>
            
            <div class="qr-display">
                <h3>QR Code Display:</h3>
                <div id="qrContainer">
                    <p>Click a button above to generate a QR code</p>
                </div>
            </div>
            
            <div class="qr-display">
                <h3>API Response:</h3>
                <div id="result">
                    <p>No data yet</p>
                </div>
            </div>
            
            <div class="qr-display">
                <h3>Debug Info:</h3>
                <div id="debugInfo">
                    <p>Ready for testing</p>
                </div>
            </div>
        </div>
        
        <script>
            function addDebugInfo(message) {
                const debugEl = document.getElementById('debugInfo');
                const timestamp = new Date().toLocaleTimeString();
                debugEl.innerHTML = \`<p><strong>[\${timestamp}]</strong> \${message}</p>\` + debugEl.innerHTML;
            }
            
            function clearResults() {
                document.getElementById('qrContainer').innerHTML = '<p>Click a button above to generate a QR code</p>';
                document.getElementById('result').innerHTML = '<p>No data yet</p>';
                document.getElementById('debugInfo').innerHTML = '<p>Ready for testing</p>';
            }
            
            async function testQR() {
                try {
                    addDebugInfo('Testing QR generation from API...');
                    
                    const response = await fetch('/api/qr/session?t=' + Date.now());
                    const result = await response.json();
                    
                    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
                    
                    if (result.status === 'success') {
                        addDebugInfo('API call successful, creating image element...');
                        
                        const img = document.createElement('img');
                        img.src = result.data.qrCode;
                        img.style.width = '200px';
                        img.style.height = '200px';
                        img.style.border = '2px solid black';
                        img.style.display = 'block';
                        
                        // Add event listeners
                        img.onload = () => {
                            addDebugInfo('Image loaded successfully!');
                        };
                        
                        img.onerror = () => {
                            addDebugInfo('Image failed to load!');
                        };
                        
                        const container = document.getElementById('qrContainer');
                        container.innerHTML = '';
                        container.appendChild(img);
                        
                        addDebugInfo('Image element created and added to DOM');
                    } else {
                        addDebugInfo('API returned error: ' + result.message);
                    }
                } catch (error) {
                    addDebugInfo('Exception occurred: ' + error.message);
                    document.getElementById('result').innerHTML = '<p class="error">Error: ' + error.message + '</p>';
                }
            }
            
            function testDirectQR() {
                try {
                    addDebugInfo('Testing direct QR code display...');
                    
                    // Create a simple test QR code data
                    const testData = {
                        test: true,
                        timestamp: new Date().toISOString(),
                        message: "Hello QR Code!"
                    };
                    
                    // Create a simple colored div as a placeholder
                    const div = document.createElement('div');
                    div.style.width = '200px';
                    div.style.height = '200px';
                    div.style.backgroundColor = '#007bff';
                    div.style.color = 'white';
                    div.style.display = 'flex';
                    div.style.alignItems = 'center';
                    div.style.justifyContent = 'center';
                    div.style.borderRadius = '10px';
                    div.style.fontSize = '12px';
                    div.style.textAlign = 'center';
                    div.style.padding = '10px';
                    div.innerHTML = 'Test QR<br>Placeholder';
                    
                    const container = document.getElementById('qrContainer');
                    container.innerHTML = '';
                    container.appendChild(div);
                    
                    addDebugInfo('Test placeholder created successfully');
                    
                } catch (error) {
                    addDebugInfo('Error in direct test: ' + error.message);
                }
            }
        </script>
    </body>
    </html>
  `);
});
// Error handling
app.use(logger_1.errorLogger);
app.use(error_middleware_1.errorMiddleware);
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     description: Check the health status of the service
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Service is healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       description: Service uptime in seconds
 *                     environment:
 *                       type: string
 *                       description: Current environment
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
app.get('/health', (req, res) => {
    const response = validation_1.ApiResponse.success({
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    }, 'Service is healthy', 200);
    return validation_1.ApiResponse.send(res, response);
});
exports.default = app;
