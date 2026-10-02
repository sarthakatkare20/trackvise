import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'trackvise-super-secret-jwt-key-production-ready-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extracts and verifies the current session user from the request.
 * Reads from Authorization: Bearer <token> or Cookie: trackvise_token=<token>
 */
export async function getAuthUser(req: NextRequest) {
  let token = '';

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookie = req.cookies.get('trackvise_token') || req.cookies.get('rf_token');
    if (cookie) {
      token = cookie.value;
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      tenant: true
    }
  });

  if (!user || user.status !== 'ACTIVE') return null;

  return user;
}

/**
 * Middleware helper that guarantees an authenticated user.
 * Optional roles filter e.g. ['SUPER_ADMIN', 'BUSINESS_ADMIN']
 */
export async function authenticate(req: NextRequest, allowedRoles?: string[]) {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized. Please login to continue.' },
        { status: 401 }
      )
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Forbidden. You do not have permission to perform this action.' },
        { status: 403 }
      )
    };
  }

  // Check if tenant is suspended (for non-SUPER_ADMIN)
  if (user.role !== 'SUPER_ADMIN' && user.tenant && user.tenant.status === 'SUSPENDED') {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Account suspended. Please contact platform support.' },
        { status: 403 }
      )
    };
  }

  // For SUPER_ADMIN: allow simulating or accessing specific tenant if header 'x-tenant-id' is provided
  let effectiveTenantId = user.tenantId;
  const requestedTenantId = req.headers.get('x-tenant-id');
  if (user.role === 'SUPER_ADMIN' && requestedTenantId) {
    effectiveTenantId = requestedTenantId;
  }

  return {
    user,
    tenantId: effectiveTenantId,
    errorResponse: null
  };
}
