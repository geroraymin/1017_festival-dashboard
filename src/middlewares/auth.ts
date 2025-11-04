import { Context, Next } from 'hono'
import { verifyToken, extractToken, JWTPayload } from '../lib/jwt'
import type { Env } from '../lib/d1'

// Context에 user 정보 추가
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload
  }
}

/**
 * JWT 인증 미들웨어
 * Authorization 헤더에서 토큰을 추출하고 검증
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractToken(authHeader)

  if (!token) {
    return c.json({ error: '인증 토큰이 필요합니다.' }, 401)
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET)

  if (!payload) {
    return c.json({ error: '유효하지 않은 토큰입니다.' }, 401)
  }

  // Context에 user 정보 저장
  c.set('user', payload)
  
  await next()
}

/**
 * 관리자 권한 확인 미들웨어
 * authMiddleware 이후에 사용해야 함
 */
export async function adminOnly(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user')

  if (!user || user.role !== 'admin') {
    return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
  }

  await next()
}

/**
 * 운영자 또는 관리자 권한 확인 미들웨어
 * authMiddleware 이후에 사용해야 함
 */
export async function operatorOrAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user')

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return c.json({ error: '운영자 또는 관리자 권한이 필요합니다.' }, 403)
  }

  await next()
}
