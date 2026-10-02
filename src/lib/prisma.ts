import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // Check possible paths for SQLite database file
  const possiblePaths = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
    path.resolve('./prisma/dev.db')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return `file:${p.replace(/\\/g, '/')}`;
    }
  }

  return envUrl || `file:${path.join(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/')}`;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl
          }
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
