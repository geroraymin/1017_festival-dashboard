/**
 * D1 데이터베이스 헬퍼 함수
 */
import type { D1Database } from '@cloudflare/workers-types'

export type Env = {
  DB: D1Database
  JWT_SECRET: string
  RESEND_API_KEY?: string
}

/**
 * D1 쿼리 결과를 단일 객체로 변환
 */
export function getFirst<T>(result: any): T | null {
  return result.results?.[0] || null
}

/**
 * D1 쿼리 결과를 배열로 변환
 */
export function getAll<T>(result: any): T[] {
  return result.results || []
}
