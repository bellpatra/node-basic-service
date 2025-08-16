import { PrismaClient, Prisma } from '@prisma/client';

// Initialize Prisma client for database access
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Middleware to log the duration of each Prisma query.
 */
prisma.$use(async (params: any, next: any) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  return result;
});

export default prisma;
