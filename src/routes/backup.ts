import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { type Env } from '../lib/d1'
import { authMiddleware, adminOnly } from '../middlewares/auth'

const backup = new Hono<{ Bindings: Env }>()

// CORS 설정 (preflight 요청 허용)
backup.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true
}))

// 모든 라우트에 관리자 권한 필요
backup.use('/*', authMiddleware, adminOnly)

/**
 * GET /api/backup/export
 * 전체 데이터베이스 백업 (JSON 형식)
 */
backup.get('/export', async (c) => {
  try {
    const db = c.env.DB
    const backupDate = new Date().toISOString()

    // 1. 행사 데이터
    const eventsResult = await db
      .prepare('SELECT * FROM events ORDER BY created_at DESC')
      .all()

    // 2. 부스 데이터
    const boothsResult = await db
      .prepare('SELECT * FROM booths ORDER BY created_at DESC')
      .all()

    // 3. 참가자 데이터
    const participantsResult = await db
      .prepare('SELECT * FROM participants ORDER BY created_at DESC')
      .all()

    // 4. 관리자 데이터 (비밀번호 해시 포함)
    const adminsResult = await db
      .prepare('SELECT * FROM admins')
      .all()

    // 5. 운영자 데이터 (비밀번호 해시 포함)
    const operatorsResult = await db
      .prepare('SELECT * FROM operators')
      .all()

    // 통계 계산
    const totalParticipants = participantsResult.results?.length || 0
    const uniqueParticipants = participantsResult.results?.filter((p: any) => p.is_duplicate === 0).length || 0

    // 백업 데이터 구성
    const backupData = {
      backup_date: backupDate,
      version: '1.0',
      system: 'guestbook-system',
      data: {
        events: eventsResult.results || [],
        booths: boothsResult.results || [],
        participants: participantsResult.results || [],
        admins: adminsResult.results || [],
        operators: operatorsResult.results || []
      },
      statistics: {
        total_events: eventsResult.results?.length || 0,
        total_booths: boothsResult.results?.length || 0,
        total_participants: totalParticipants,
        unique_participants: uniqueParticipants,
        duplicate_visits: totalParticipants - uniqueParticipants
      },
      metadata: {
        exported_by: c.get('user').username || 'admin',
        exported_at: backupDate
      }
    }

    return c.json(backupData)
  } catch (error) {
    console.error('Backup export error:', error)
    return c.json({ error: '백업 내보내기에 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/backup/import
 * 백업 데이터 복원 (선택사항 - 위험할 수 있음)
 */
backup.post('/import', async (c) => {
  try {
    const body = await c.req.json()
    
    // 백업 데이터 검증
    if (!body.version || !body.data) {
      return c.json({ error: '유효하지 않은 백업 파일입니다.' }, 400)
    }

    const db = c.env.DB
    const { data } = body

    // 트랜잭션 시뮬레이션 (D1은 명시적 트랜잭션 없음)
    let importedCount = 0

    // 1. 행사 복원 (중복 체크)
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        try {
          await db
            .prepare(`
              INSERT OR IGNORE INTO events (id, name, start_date, end_date, is_active, created_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `)
            .bind(
              event.id,
              event.name,
              event.start_date,
              event.end_date,
              event.is_active,
              event.created_at
            )
            .run()
          importedCount++
        } catch (err) {
          console.error('Event import error:', err)
        }
      }
    }

    // 2. 부스 복원 (중복 체크)
    if (data.booths && Array.isArray(data.booths)) {
      for (const booth of data.booths) {
        try {
          await db
            .prepare(`
              INSERT OR IGNORE INTO booths (id, event_id, name, description, booth_code, is_active, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              booth.id,
              booth.event_id,
              booth.name,
              booth.description,
              booth.booth_code,
              booth.is_active,
              booth.created_at
            )
            .run()
          importedCount++
        } catch (err) {
          console.error('Booth import error:', err)
        }
      }
    }

    // 3. 참가자 복원 (중복 체크)
    if (data.participants && Array.isArray(data.participants)) {
      for (const participant of data.participants) {
        try {
          await db
            .prepare(`
              INSERT OR IGNORE INTO participants (id, booth_id, name, gender, grade, date_of_birth, has_consented, is_duplicate, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              participant.id,
              participant.booth_id,
              participant.name,
              participant.gender,
              participant.grade,
              participant.date_of_birth,
              participant.has_consented,
              participant.is_duplicate,
              participant.created_at
            )
            .run()
          importedCount++
        } catch (err) {
          console.error('Participant import error:', err)
        }
      }
    }

    return c.json({
      message: '백업 데이터 복원이 완료되었습니다.',
      imported_count: importedCount,
      statistics: {
        events: data.events?.length || 0,
        booths: data.booths?.length || 0,
        participants: data.participants?.length || 0
      }
    })
  } catch (error) {
    console.error('Backup import error:', error)
    return c.json({ error: '백업 복원에 실패했습니다.' }, 500)
  }
})

export default backup
