const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

console.log('Resetting and re-seeding Trackvise Demo environment...');
try {
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  console.log('✅ Trackvise Demo environment reset successfully!');
} catch (error) {
  console.error('Error resetting demo:', error.message);
  process.exit(1);
}
