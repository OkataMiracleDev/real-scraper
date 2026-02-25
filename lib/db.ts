import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Debug: Log the DATABASE_URL (first 20 chars only for security)
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL exists, starts with:', process.env.DATABASE_URL.substring(0, 20));
} else {
  console.error('DATABASE_URL is not set!');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
