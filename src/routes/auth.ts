import { Hono } from 'hono'
import { createSupabaseClient, type Env } from '../lib/supabase'
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

    // Supabase에서 관리자 정보 조회
    const supabase = createSupabaseClient(c.env)
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return c.json({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        message: '다시 한 번 확인해주세요. 문제가 계속되면 관리자에게 문의하세요.'
      }, 401)
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, admin.password_hash)

    if (!isValidPassword) {
      return c.json({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        message: '다시 한 번 확인해주세요. 문제가 계속되면 관리자에게 문의하세요.'
      }, 401)
    }

    // JWT 토큰 생성
    const token = await createToken(
      {
        id: admin.id,
        role: 'admin',
        username: admin.username
      },
      c.env.JWT_SECRET
    )

    const response: LoginResponse = {
      token,
      user: {
        id: admin.id,
        username: admin.username,
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

    // Supabase에서 부스 정보 조회
    const supabase = createSupabaseClient(c.env)
    const { data: booth, error } = await supabase
      .from('booths')
      .select('*')
      .eq('booth_code', booth_code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !booth) {
      return c.json({ 
        error: '유효하지 않은 부스 코드입니다.',
        message: '부스 코드를 다시 확인해주세요. 부스가 비활성 상태이거나 코드가 잘못되었을 수 있습니다.'
      }, 401)
    }

    // JWT 토큰 생성
    const token = await createToken(
      {
        id: booth.id,
        role: 'operator',
        booth_id: booth.id,
        booth_code: booth.booth_code
      },
      c.env.JWT_SECRET
    )

    const response: LoginResponse = {
      token,
      user: {
        id: booth.id,
        booth_id: booth.id,
        booth_code: booth.booth_code,
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
