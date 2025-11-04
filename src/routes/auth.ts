import { Hono } from 'hono'
import { type Env, getFirst } from '../lib/d1'
import { createToken } from '../lib/jwt'
import { verifyPassword } from '../lib/password'
import type { LoginRequest, BoothLoginRequest, LoginResponse } from '../types/database'

const auth = new Hono<{ Bindings: Env }>()

/**
 * POST /api/auth/admin
 * 관리자 로그인
 */
auth.post('/admin', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>()
    const { username, password } = body

    if (!username || !password) {
      return c.json({ error: '아이디와 비밀번호를 입력해주세요.' }, 400)
    }

    // D1에서 관리자 정보 조회
    const db = c.env.DB
    const adminResult = await db
      .prepare('SELECT * FROM admins WHERE username = ?')
      .bind(username)
      .first()

    if (!adminResult) {
      return c.json({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        message: '다시 한 번 확인해주세요. 문제가 계속되면 관리자에게 문의하세요.'
      }, 401)
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, adminResult.password_hash as string)

    if (!isValidPassword) {
      return c.json({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        message: '다시 한 번 확인해주세요. 문제가 계속되면 관리자에게 문의하세요.'
      }, 401)
    }

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
