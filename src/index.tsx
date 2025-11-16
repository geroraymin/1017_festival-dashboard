import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Env } from './lib/d1'

// 라우트 임포트
import auth from './routes/auth'
import events from './routes/events'
import booths from './routes/booths'
import participants from './routes/participants'
import stats from './routes/stats'
import publicStats from './routes/public-stats'
import email from './routes/email'
import backup from './routes/backup'
import queue from './routes/queue'

// 페이지 템플릿 임포트
import { adminLoginPage, operatorLoginPage } from './views/pages'
import { guestbookPage } from './views/guestbook'
import { operatorDashboardPage } from './views/operator-dashboard'
import { adminDashboardPage } from './views/admin-dashboard'
import { statsDisplayPage } from './views/stats-display'
import { queueDisplayPage } from './views/queue-display'
import { queueTicketPage } from './views/queue-ticket'

const app = new Hono<{ Bindings: Env }>()

// CORS 설정
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true
}))

// API 라우트 등록
app.route('/api/auth', auth)
app.route('/api/events', events)
app.route('/api/booths', booths)
app.route('/api/participants', participants)
app.route('/api/stats', stats)
app.route('/api/public/stats', publicStats)
app.route('/api/email', email)
app.route('/api/backup', backup)
app.route('/api/queue', queue)

// 정적 파일 서빙
app.use('/static/*', serveStatic({ root: './public' }))

// PWA Service Worker - Cloudflare Pages에서 자동으로 dist 루트 파일 제공
// sw.js와 offline.html은 빌드 시 dist/에 복사되어 자동 서빙됨

// PWA 매니페스트 (JSON 직접 반환)
app.get('/manifest.json', (c) => {
  return c.json({
    name: '제미나이 부스 디지털 방명록',
    short_name: '방명록',
    description: '축제 및 행사를 위한 디지털 방명록 시스템',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4F46E5',
    orientation: 'portrait',
    icons: [
      {
        src: '/static/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/static/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    categories: ['productivity', 'utilities'],
    lang: 'ko-KR',
    dir: 'ltr'
  })
})

// Service Worker와 오프라인 페이지는 Cloudflare Pages에서 자동 제공
// (dist 폴더에 있는 파일들이 루트에서 직접 접근 가능)

// 헬스 체크
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '축제 디지털방명록 시스템'
  })
})

// 메인 페이지 (로그인 선택)
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>축제 디지털방명록 시스템</title>
        
        <!-- PWA 설정 -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#007AFF">
        
        <link rel="stylesheet" href="/static/style.css">
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body style="background: linear-gradient(135deg, #F5F7FA, #E3F2FD); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem;">
        <div style="max-width: 28rem; width: 100%;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="display: inline-block; padding: 1rem; background: linear-gradient(135deg, #007AFF, #00A0B0); border-radius: 50%; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);">
                    <i class="fas fa-clipboard-list" style="color: white; font-size: 2.5rem;"></i>
                </div>
                <h1 class="text-title1" style="color: #1D1D1F; margin-bottom: 0.5rem;">축제 디지털방명록</h1>
                <p class="text-body" style="color: #6E6E73;">시스템 로그인</p>
            </div>

            <div class="card" style="padding: 2rem;">
                <a href="/admin" class="btn btn-primary btn-lg" style="width: 100%; margin-bottom: 1rem; text-decoration: none; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #007AFF, #0051D5);">
                    <i class="fas fa-user-shield" style="margin-right: 0.5rem;"></i>
                    관리자 로그인
                </a>

                <a href="/operator" class="btn btn-secondary btn-lg" style="width: 100%; text-decoration: none; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #00A0B0, #0099CC);">
                    <i class="fas fa-users" style="margin-right: 0.5rem;"></i>
                    부스 운영자 로그인
                </a>
            </div>

            <p class="text-caption1" style="text-align: center; color: #8E8E93; margin-top: 1.5rem;">
                © 2025 축제 디지털방명록 시스템. All rights reserved.
            </p>
        </div>
    </body>
    </html>
  `)
})

// 관리자 로그인 페이지
app.get('/admin', (c) => {
  return c.html(adminLoginPage)
})

// 운영자 로그인 페이지
app.get('/operator', (c) => {
  return c.html(operatorLoginPage)
})

// 방명록 작성 페이지
app.get('/guestbook', (c) => {
  return c.html(guestbookPage)
})

// 운영자 대시보드
app.get('/dashboard/operator', (c) => {
  return c.html(operatorDashboardPage)
})

// 관리자 대시보드
app.get('/dashboard/admin', (c) => {
  return c.html(adminDashboardPage)
})

// 통계 디스플레이 페이지
app.get('/display', (c) => {
  return c.html(statsDisplayPage)
})

// 대기열 디스플레이 페이지
app.get('/queue-display', (c) => {
  return c.html(queueDisplayPage)
})

// 큐 티켓 페이지 (참가자용)
app.get('/queue-ticket', (c) => {
  return c.html(queueTicketPage)
})

// 404 에러 핸들링
app.notFound((c) => {
  return c.json({ error: '요청하신 페이지를 찾을 수 없습니다.' }, 404)
})

// 에러 핸들링
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: '서버 오류가 발생했습니다.' }, 500)
})

export default app
