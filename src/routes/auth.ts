import { Hono } from 'hono'
import { type Env, getFirst } from '../lib/d1'
import { createToken } from '../lib/jwt'
import { verifyPassword } from '../lib/password'
import { getClientIp, isJwtSecretConfigured } from '../lib/security'
import type { LoginRequest, BoothLoginRequest, LoginResponse } from '../types/database'

const auth = new Hono<{ Bindings: Env }>()
const ADMIN_LOGIN_WINDOW_MINUTES = 15
const ADMIN_LOGIN_MAX_FAILURES = 5

async function countRecentAdminFailures(db: Env['DB'], username: string, ipAddress: string): Promise<number> {
  try {
    const row = await db
      .prepare(`
        SELECT COUNT(*) as count
        FROM login_attempts
        WHERE username = ?
          AND ip_address = ?
          AND success = 0
          AND attempted_at >= datetime('now', ?)
      `)
      .bind(username, ipAddress, `-${ADMIN_LOGIN_WINDOW_MINUTES} minutes`)
      .first<{ count: number }>()

    return Number(row?.count || 0)
  } catch (error) {
    console.warn('Admin login throttling unavailable:', error)
    return 0
  }
}

async function recordAdminLoginAttempt(db: Env['DB'], username: string, ipAddress: string, success: boolean): Promise<void> {
  try {
    await db
      .prepare(`
        INSERT INTO login_attempts (username, ip_address, success)
        VALUES (?, ?, ?)
      `)
      .bind(username, ipAddress, success ? 1 : 0)
      .run()

    if (success) {
      await db
        .prepare('DELETE FROM login_attempts WHERE username = ? AND ip_address = ? AND success = 0')
        .bind(username, ipAddress)
        .run()
    }
  } catch (error) {
    console.warn('Failed to record admin login attempt:', error)
  }
}

/**
 * POST /api/auth/admin
 * 관리자 로그인
 */
auth.post('/admin', async (c) => {
  try {
    if (!isJwtSecretConfigured(c.env.JWT_SECRET)) {
      return c.json({ error: 'JWT secret is not configured securely.' }, 500)
    }

    const body = await c.req.json<LoginRequest>()
    const username = body.username?.trim()
    const { password } = body

    if (!username || !password) {
      return c.json({ error: '아이디와 비밀번호를 입력해주세요.' }, 400)
    }

    const db = c.env.DB
    const ipAddress = getClientIp(c)
    const recentFailures = await countRecentAdminFailures(db, username, ipAddress)

    if (recentFailures >= ADMIN_LOGIN_MAX_FAILURES) {
      return c.json({
        error: '로그인 시도가 너무 많습니다.',
        message: `${ADMIN_LOGIN_WINDOW_MINUTES}분 후 다시 시도해주세요.`
      }, 429)
    }

    // D1에서 관리자 정보 조회
    const adminResult = await db
      .prepare('SELECT * FROM admins WHERE username = ?')
      .bind(username)
      .first()

    if (!adminResult) {
      await recordAdminLoginAttempt(db, username, ipAddress, false)
      return c.json({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        message: '다시 한 번 확인해주세요. 문제가 계속되면 관리자에게 문의하세요.'
      }, 401)
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, adminResult.password_hash as string)

    if (!isValidPassword) {
      await recordAdminLoginAttempt(db, username, ipAddress, false)
      return c.json({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        message: '다시 한 번 확인해주세요. 문제가 계속되면 관리자에게 문의하세요.'
      }, 401)
    }

    await recordAdminLoginAttempt(db, username, ipAddress, true)

    // JWT 토큰 생성
    const token = await createToken(
      {
        id: String(adminResult.id),
        role: 'admin',
        username: adminResult.username as string
      },
      c.env.JWT_SECRET
    )

    const response: LoginResponse = {
      token,
      user: {
        id: String(adminResult.id),
        username: adminResult.username as string,
        role: 'admin'
      }
    }

    return c.json(response)
  } catch (error) {
    console.error('Admin login error:', error)
    return c.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * POST /api/auth/operator
 * 부스 코드로 운영자 로그인
 */
auth.post('/operator', async (c) => {
  try {
    if (!isJwtSecretConfigured(c.env.JWT_SECRET)) {
      return c.json({ error: 'JWT secret is not configured securely.' }, 500)
    }

    const body = await c.req.json<BoothLoginRequest>()
    const { booth_code } = body

    if (!booth_code) {
      return c.json({ error: '부스 코드를 입력해주세요.' }, 400)
    }

    // D1에서 부스 정보 조회
    const db = c.env.DB
    const boothResult = await db
      .prepare('SELECT * FROM booths WHERE booth_code = ? AND is_active = 1')
      .bind(booth_code.toUpperCase())
      .first()

    if (!boothResult) {
      return c.json({ 
        error: '유효하지 않은 부스 코드입니다.',
        message: '부스 코드를 다시 확인해주세요. 부스가 비활성 상태이거나 코드가 잘못되었을 수 있습니다.'
      }, 401)
    }

    // JWT 토큰 생성
    const token = await createToken(
      {
        id: String(boothResult.id),
        role: 'operator',
        booth_id: String(boothResult.id),
        booth_code: boothResult.booth_code as string
      },
      c.env.JWT_SECRET
    )

    const response: LoginResponse = {
      token,
      user: {
        id: String(boothResult.id),
        booth_id: String(boothResult.id),
        booth_code: boothResult.booth_code as string,
        role: 'operator'
      }
    }

    return c.json(response)
  } catch (error) {
    console.error('Operator login error:', error)
    return c.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

/**
 * POST /api/auth/verify
 * 토큰 검증 (선택적)
 */
auth.post('/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return c.json({ error: '토큰이 제공되지 않았습니다.' }, 401)
  }

  try {
    if (!isJwtSecretConfigured(c.env.JWT_SECRET)) {
      return c.json({ error: 'JWT secret is not configured securely.' }, 500)
    }

    const { verifyToken } = await import('../lib/jwt')
    const payload = await verifyToken(token, c.env.JWT_SECRET)

    if (!payload) {
      return c.json({ error: '유효하지 않은 토큰입니다.' }, 401)
    }

    return c.json({ valid: true, user: payload })
  } catch (error) {
    return c.json({ error: '토큰 검증 중 오류가 발생했습니다.' }, 500)
  }
})

export default auth
