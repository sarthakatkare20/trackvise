const { execSync } = require('child_process');

async function main() {
  // Ensure DATABASE_URL is mapped from Vercel / Supabase integration variables
  const dbUrl =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;

  if (dbUrl) {
    process.env.DATABASE_URL = dbUrl;
    console.log('Mapped database URL for Prisma build step.');
  }

  try {
    console.log('Syncing Prisma schema with database...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('Seeding initial data if needed...');
    execSync('node prisma/seed.js', {
      stdio: 'inherit',
      env: process.env
    });
  } catch (error) {
    console.error('Database sync warning (continuing build):', error.message);
  }
}

main();
