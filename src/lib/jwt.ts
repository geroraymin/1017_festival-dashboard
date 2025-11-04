import { sign, verify } from 'hono/jwt'
import type { Env } from './d1'

export interface JWTPayload {
  id: string
  role: 'admin' | 'operator'
  username?: string
  booth_id?: string
  booth_code?: string
  exp?: number
}

/**
 * JWT 토큰 생성
 * @param payload 토큰에 담을 데이터
 * @param secret JWT 시크릿 키
 * @param expiresIn 만료 시간 (초 단위, 기본 24시간)
 */
export async function createToken(
  payload: Omit<JWTPayload, 'exp'>,
  secret: string,
  expiresIn: number = 86400 // 24시간
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const tokenPayload: JWTPayload = {
    ...payload,
    exp: now + expiresIn
  }
  return await sign(tokenPayload, secret)
}

/**
 * JWT 토큰 검증
 * @param token JWT 토큰
 * @param secret JWT 시크릿 키
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, secret) as JWTPayload
    
    // 만료 시간 확인
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Authorization 헤더에서 토큰 추출
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
