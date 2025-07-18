# Auth Service Node

A TypeScript-based authentication microservice with Express and Prisma.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Docker and Docker Compose (optional, for containerized database)

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
  - Body: `{ "username": "string", "password": "string" }`

- **Login**
  - POST `/api/users/login`
  - Body: `{ "username": "string", "password": "string" }`

- **Get Profile**
  - GET `/api/users/profile`
  - Headers: `Authorization: Bearer <token>`

## Environment Variables

Create a `.env` file with:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/authdb?schema=public"
JWT_SECRET="your-super-secret-key-change-this-in-production"
PORT=3000
```

## Project Structure

```
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── modules/
│   │   └── user/            # User module (routes, controller, service)
│   ├── middlewares/         # Auth & error middlewares
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
└── package.json
```

## Security Notes

1. Change the JWT_SECRET in production
2. Use strong password hashing (already implemented with bcrypt)
3. Implement rate limiting for production use
4. Use HTTPS in production