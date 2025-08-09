# Node Basic Service

A comprehensive TypeScript-based Node.js service with authentication, standardized API responses, event-driven architecture, and multi-identifier login support.

## Features

- 🔐 **Multi-Identifier Authentication** - Login with username, email, or phone
- 📊 **Standardized API Responses** - Consistent response format across all endpoints
- 🎯 **Event-Driven Architecture** - Kafka integration for scalable messaging
- 🚀 **Redis Caching** - High-performance caching layer
- 🛡️ **Security Features** - JWT tokens, password hashing, input validation
- 📝 **TypeScript** - Full type safety and developer experience
- 🗄️ **Prisma ORM** - Type-safe database operations
- 📋 **Comprehensive Logging** - Structured logging with Winston

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- Docker and Docker Compose (optional, for containerized services)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   
   Option A - Using Docker:
   ```bash
   # Start Docker Desktop
   docker-compose up -d
   ```

   Option B - Using local PostgreSQL:
   - Create a database named 'authdb'
   - Update DATABASE_URL in .env file with your credentials

3. **Initialize Database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```

   For development with hot-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **Register User**
  - POST `/api/users/register`
  - Body: 
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "+1234567890",        // Optional
      "password": "MySecurePass123!",
      "fullName": "John Doe",        // Optional
      "role": "user"                 // Optional
    }
    ```

- **Login** (Multi-Identifier Support)
  - POST `/api/users/login`
  - Body: 
    ```json
    {
      "identifier": "johndoe",      // Can be username, email, or phone
      "password": "MySecurePass123!"
    }
    ```

- **Get Profile**
  - GET `/api/users/profile`
  - Headers: `Authorization: Bearer <token>`

- **Update Profile**
  - PUT `/api/users/profile`
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "fullName": "John Doe",       // Optional
      "email": "newemail@example.com", // Optional
      "phone": "+0987654321",       // Optional
      "currentPassword": "current", // Required if changing password
      "newPassword": "NewPass123!"  // Optional
    }
    ```

- **Refresh Token**
  - POST `/api/users/refresh`
  - Body: `{ "refreshToken": "string" }` or Cookie

- **Password Reset Request**
  - POST `/api/users/password-reset`
  - Body: `{ "email": "user@example.com" }`

- **Password Reset Confirm**
  - POST `/api/users/password-reset/confirm`
  - Body: `{ "token": "reset-token", "password": "NewPass123!" }`

- **Logout**
  - POST `/api/users/logout`
  - Headers: `Authorization: Bearer <token>`

## Environment Variables

Create a `.env` file with:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nodebasicdb?schema=public"

# JWT Secrets
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development

# Redis
REDIS_URL="redis://localhost:6379"

# Kafka (optional)
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="node-basic-service"

# CORS
CORS_ORIGIN="*"

# Logging
LOG_LEVEL="info"
```

## Project Structure

```
node-basic-service/
├── prisma/
│   ├── migrations/          # Database migration files
│   │   ├── 20250711201130_add_user_fields/
│   │   ├── 20250808211433_/
│   │   ├── 20250809064531_init/
│   │   ├── 20250809071800_init/
│   │   ├── 20250809073100_init/
│   │   └── migration_lock.toml
│   └── schema.prisma        # Database schema definition
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Main config exports
│   │   ├── kafka.ts         # Kafka configuration
│   │   ├── prisma.ts        # Prisma client setup
│   │   └── redis.ts         # Redis configuration
│   ├── events/              # Event-driven architecture
│   │   ├── consumers/       # Event consumers
│   │   │   └── user.consumer.ts
│   │   └── producers/       # Event producers
│   │       └── user.producer.ts
│   ├── examples/            # Code examples and documentation
│   │   ├── api-response-examples.ts  # API response examples
│   │   └── multi-login-examples.ts   # Multi-identifier login examples
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts        # JWT authentication
│   │   └── error.middleware.ts       # Global error handling
│   ├── modules/             # Feature modules
│   │   └── user/            # User management module
│   │       ├── user.controller.ts    # HTTP request handlers
│   │       ├── user.event.ts         # User-related events
│   │       ├── user.interface.ts     # TypeScript interfaces
│   │       ├── user.route.ts         # Express routes
│   │       ├── user.schema.ts        # Zod validation schemas
│   │       └── user.service.ts       # Business logic
│   ├── utils/               # Utility functions
│   │   ├── cache.ts         # Redis caching utilities
│   │   ├── logger.ts        # Winston logging setup
│   │   ├── security.ts      # JWT and password utilities
│   │   └── validation.ts    # API response utilities & validation
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── docker-compose.yml      # Docker services (PostgreSQL, Redis, Kafka)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── index.js               # Legacy entry point
├── index.ts               # TypeScript entry point
├── API_RESPONSE_GUIDE.md   # API response standards documentation
└── README.md              # This file
```

## API Response Format

All API endpoints return responses in a standardized format:

```json
{
  "status": "success|error|fail",
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { /* Response data */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": { /* For paginated responses */ },
    "requestId": "optional-request-id"
  },
  "errors": [ /* Validation errors if any */ ]
}
```

See `API_RESPONSE_GUIDE.md` for detailed documentation and examples.

## Architecture Features

### 🏗️ **Modular Architecture**
- Clean separation of concerns with modules
- Each feature has its own controller, service, routes, and schemas
- Reusable utilities and middlewares

### 🎯 **Event-Driven Design**
- Kafka integration for scalable messaging
- Event producers and consumers for decoupled communication
- User lifecycle events (created, authenticated, password changed)

### 🚀 **Performance & Caching**
- Redis integration for high-performance caching
- User session caching and token management
- Configurable cache TTL for different data types

### 🛡️ **Security & Validation**
- JWT-based authentication with refresh tokens
- Multi-identifier login (username/email/phone)
- Strong password policies and bcrypt hashing
- Input validation with Zod schemas
- HTTP-only cookies for refresh tokens

### 📊 **Observability**
- Structured logging with Winston
- Request/response logging middleware
- Error tracking and monitoring ready

## Development Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Database operations
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio

# Linting and formatting
npm run lint              # ESLint
npm run format            # Prettier
```

## Security Notes

1. **Environment Variables**: Change all secrets in production
2. **Password Security**: Strong hashing with bcrypt (implemented)
3. **JWT Tokens**: Secure token generation with refresh mechanism
4. **Rate Limiting**: Implement rate limiting for production use
5. **HTTPS**: Use HTTPS in production environments
6. **Input Validation**: All inputs validated with Zod schemas
7. **CORS**: Configure CORS for your specific domains
8. **Database Security**: Use connection pooling and prepared statements