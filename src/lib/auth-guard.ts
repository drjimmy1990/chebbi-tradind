import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// In-memory session store – for browser dashboard sessions
// ---------------------------------------------------------------------------
const sessions = new Map<string, { username: string; createdAt: number }>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export { sessions, SESSION_TTL_MS };

// ---------------------------------------------------------------------------
// Simple cache to avoid hitting DB on every single request from n8n
// Refreshes every 5 minutes.
// ---------------------------------------------------------------------------
let cachedApiKey: string | null = null;
let apiKeyCachedAt = 0;
const API_KEY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getApiKey(): Promise<string | null> {
  if (cachedApiKey && Date.now() - apiKeyCachedAt < API_KEY_CACHE_TTL) {
    return cachedApiKey;
  }
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: 'webhookSecret' } });
    cachedApiKey = setting?.value ?? null;
    apiKeyCachedAt = Date.now();
  } catch {
    // DB unavailable — keep using cached value
  }
  return cachedApiKey;
}

// ---------------------------------------------------------------------------
// Extract raw token from request (cookie or Bearer header)
// ---------------------------------------------------------------------------
function extractToken(request: NextRequest): string | null {
  // 1. Cookie (browser/dashboard sessions)
  const cookie = request.cookies.get('admin_token')?.value;
  if (cookie) return cookie;

  // 2. Authorization: Bearer <token> header
  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 3. ?secret=... query param (same as webhook secret approach)
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret) return querySecret;

  return null;
}

/**
 * Check if the current request has a valid admin session OR a valid API key.
 *
 * Priority:
 *  1. Cookie session (browser dashboard)
 *  2. Bearer token = session token (short-lived login)
 *  3. Bearer token = webhookSecret from DB (permanent, never expires)
 *  4. ?secret= query param = webhookSecret from DB (permanent)
 *
 * Returns the username if authenticated, or null otherwise.
 */
export async function getSession(request: NextRequest): Promise<{ username: string } | null> {
  const token = extractToken(request);
  if (!token) return null;

  // Try in-memory session first (fast path for browser/curl login tokens)
  const session = sessions.get(token);
  if (session) {
    if (Date.now() - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(token);
    } else {
      return { username: session.username };
    }
  }

  // Fallback: check if token matches the permanent webhookSecret from DB
  const apiKey = await getApiKey();
  if (apiKey && token === apiKey) {
    return { username: 'api-key' };
  }

  return null;
}

/**
 * Middleware helper – must be awaited.
 * Usage:
 *   const session = await requireAuth(request);
 *   if (!session) return unauthorizedResponse();
 */
export async function requireAuth(
  request: NextRequest,
): Promise<{ username: string } | null> {
  return getSession(request);
}

/**
 * Shortcut: returns a 401 JSON response.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
