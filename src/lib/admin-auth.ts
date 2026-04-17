import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================================
// SERVER-SIDE: JWT and Admin Auth (used by API routes)
// ============================================================

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-secret-change-me';

function base64url(input: Buffer | string): string {
  const str = typeof input === 'string' ? input : Buffer.from(input);
  return str.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urldecode(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString();
}

export function generateAdminToken(payload: {
  adminUserId: string;
  email: string;
  role: string;
}): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60; // 7 days
  const payloadStr = base64url(
    JSON.stringify({ ...payload, iat: now, exp })
  );
  const signature = base64url(
    crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payloadStr}`).digest()
  );
  return `${header}.${payloadStr}.${signature}`;
}

export function verifyAdminToken(token: string):
  | { adminUserId: string; email: string; role: string }
  | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = base64url(
      crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest()
    );
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(base64urldecode(payload));
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      adminUserId: decoded.adminUserId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export const requireAdmin = requireAdminAuth;

export function requireAdminAuth(
  request: NextRequest
): { adminUserId: string; email: string; role: string } | NextResponse {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const payload = verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 401 });
  }
  return payload;
}

export function requireSuperAdmin(
  request: NextRequest
): { adminUserId: string; email: string; role: string } | NextResponse {
  const result = requireAdminAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'super_admin') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  return result;
}

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================
// CLIENT-SIDE: Token management (used by UI components)
// ============================================================

const ADMIN_TOKEN_KEY = 'admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export interface AdminFetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function adminFetch(url: string, options: AdminFetchOptions = {}): Promise<Response> {
  const { requireAuth = true, ...fetchOptions } = options;
  const token = requireAuth ? getAdminToken() : null;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  return res;
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export function redirectToAdminLogin(): void {
  window.location.href = '/admin/login';
}
