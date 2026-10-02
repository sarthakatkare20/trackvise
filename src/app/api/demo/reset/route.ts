import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import { authenticate } from '@/lib/auth';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const { stdout } = await execPromise('node prisma/seed.js');
    return NextResponse.json({
      success: true,
      message: 'Demo environment reset to pristine showcase state successfully.',
      output: stdout
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset demo data' },
      { status: 500 }
    );
  }
}
