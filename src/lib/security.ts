import type { Context, Next } from 'hono'
import type { Env } from './d1'

const DEFAULT_PUBLIC_URL = 'https://1017-festival-dashboard.pages.dev'
const WEAK_SECRET_MARKERS = [
  'your-super-secret',
  'your-secret-key',
  'change-this',
  'changeme',
  'secret',
]

export function getAllowedOrigins(env: Env): string[] {
  const configured = env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

  const publicUrl = env.PUBLIC_URL?.trim() || DEFAULT_PUBLIC_URL
  return Array.from(new Set([publicUrl, ...configured]))
}

export function resolveCorsOrigin(origin: string | undefined, env: Env): string | undefined {
  if (!origin) {
    return undefined
  }

  return getAllowedOrigins(env).includes(origin) ? origin : undefined
}

export function isJwtSecretConfigured(secret: string | undefined): boolean {
  if (!secret || secret.length < 32) {
    return false
  }

  const normalized = secret.toLowerCase()
  return !WEAK_SECRET_MARKERS.some((marker) => normalized.includes(marker))
}

export function getClientIp(c: Context): string {
  const forwardedFor = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  return c.req.header('cf-connecting-ip') || forwardedFor || 'unknown'
}

export async function securityHeaders(c: Context, next: Next) {
  await next()

  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  c.header('Cross-Origin-Resource-Policy', 'same-origin')
}
