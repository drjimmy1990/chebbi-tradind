import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory session store – mirrors the one in /api/auth/route.ts
// This MUST be kept in sync with the auth route's session store.
// In production, replace with a shared Redis / DB store.
// ---------------------------------------------------------------------------
const sessions = new Map<string, { username: string; createdAt: number }>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Re-export the same session map so both /api/auth and this module share
 * the exact same store at runtime.
 */
export { sessions, SESSION_TTL_MS };

/**
 * Check if the current request has a valid admin session.
 * Returns the username if authenticated, or null otherwise.
 */
export function getSession(request: NextRequest): { username: string } | null {
  // 1. Try cookie (browser/dashboard sessions)
  let token = request.cookies.get('admin_token')?.value;

  // 2. Try Authorization: Bearer <token> header (API/n8n usage)
  if (!token) {
    const authHeader = request.headers.get('authorization') ?? '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) return null;

  const session = sessions.get(token);
  if (!session || Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }

  return { username: session.username };
}

/**
 * Middleware helper – returns a 401 response if not authenticated.
 * Usage at the top of any mutating handler:
 *
 *   const session = requireAuth(request);
 *   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export function requireAuth(
  request: NextRequest,
): { username: string } | null {
  return getSession(request);
}

/**
 * Shortcut: returns a 401 JSON response.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
