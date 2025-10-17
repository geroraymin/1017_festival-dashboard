import { createClient } from '@supabase/supabase-js'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  JWT_SECRET: string
}

/**
 * Supabase 클라이언트 생성 (서비스 롤 키 사용)
 * RLS 정책을 우회하여 서버 측에서 모든 데이터에 접근 가능
 */
export function createSupabaseClient(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Supabase 클라이언트 생성 (익명 키 사용)
 * 읽기 전용 작업에 사용
 */
export function createSupabaseAnonClient(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
