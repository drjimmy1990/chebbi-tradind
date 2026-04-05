import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sessions, SESSION_TTL_MS, getSession } from '@/lib/auth-guard'

// bcryptjs needs dynamic import in server context
let bcryptModule: typeof import('bcryptjs') | null = null
async function getBcrypt() {
  if (!bcryptModule) bcryptModule = await import('bcryptjs')
  return bcryptModule
}

// ---------------------------------------------------------------------------
// POST /api/auth — Login
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 },
      )
    }

    // Use $queryRaw to avoid Turbopack stale cache issues with model definitions
    const rows = await db.$queryRaw<{ id: string; username: string; password: string }[]>`
      SELECT id, username, password FROM AdminUser WHERE username = ${username} LIMIT 1
    `
    const user = rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const bcrypt = await getBcrypt()
    if (!bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = crypto.randomUUID()
    sessions.set(token, { username: user.username, createdAt: Date.now() })

    const response = NextResponse.json({ success: true, token, username: user.username })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Auth login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth — Check session
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const session = await getSession(request)

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    username: session.username,
  })
}

// ---------------------------------------------------------------------------
// DELETE /api/auth — Logout
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (token) {
    sessions.delete(token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}

// ---------------------------------------------------------------------------
// PATCH /api/auth — Change password
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new passwords are required' },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 },
      )
    }

    // Find user
    const rows = await db.$queryRaw<{ id: string; username: string; password: string }[]>`
      SELECT id, username, password FROM AdminUser WHERE username = ${session.username} LIMIT 1
    `
    const user = rows[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const bcrypt = await getBcrypt()
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash new password and update
    const hashedNew = bcrypt.hashSync(newPassword, 10)
    await db.$executeRaw`UPDATE AdminUser SET password = ${hashedNew} WHERE id = ${user.id}`

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('Auth change-password error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// Re-export for backward compatibility
export { getSession, sessions, SESSION_TTL_MS }
