import { Hono } from 'hono'
import { type Env } from '../lib/d1'
import { authMiddleware, adminOnly } from '../middlewares/auth'
import type { CreateEventRequest } from '../types/database'

const events = new Hono<{ Bindings: Env }>()

/**
 * GET /api/events
 * 행사 목록 조회
 */
events.get('/', authMiddleware, async (c) => {
  try {
    const db = c.env.DB

    const result = await db
      .prepare('SELECT * FROM events ORDER BY created_at DESC')
      .all()

    return c.json({ events: result.results || [] })
  } catch (error) {
    console.error('Error fetching events:', error)
    return c.json({ error: '행사 목록을 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/events/:id
 * 행사 상세 조회
 */
events.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    const event = await db
      .prepare('SELECT * FROM events WHERE id = ?')
      .bind(id)
      .first()

    if (!event) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    // 부스 수 조회
    const boothCount = await db
      .prepare('SELECT COUNT(*) as count FROM booths WHERE event_id = ?')
      .bind(id)
      .first()

    // 참가자 수 조회
    const participantCount = await db
      .prepare(`
        SELECT COUNT(*) as count 
        FROM participants p 
        JOIN booths b ON p.booth_id = b.id 
        WHERE b.event_id = ?
      `)
      .bind(id)
      .first()

    return c.json({ 
      event: {
        ...event,
        booth_count: boothCount?.count || 0,
        participant_count: participantCount?.count || 0
      }
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return c.json({ error: '행사를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/events
 * 행사 생성 (관리자 전용)
 */
events.post('/', authMiddleware, adminOnly, async (c) => {
  try {
    const body = await c.req.json<CreateEventRequest>()
    const { name, start_date, end_date } = body

    if (!name) {
      return c.json({ error: '행사명은 필수입니다.' }, 400)
    }

    const db = c.env.DB

    const result = await db
      .prepare('INSERT INTO events (name, start_date, end_date) VALUES (?, ?, ?)')
      .bind(name, start_date || null, end_date || null)
      .run()

    if (!result.success) {
      return c.json({ error: '행사 생성에 실패했습니다.' }, 500)
    }

    const newEvent = await db
      .prepare('SELECT * FROM events WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first()

    return c.json({ event: newEvent }, 201)
  } catch (error) {
    console.error('Error creating event:', error)
    return c.json({ error: '행사 생성에 실패했습니다.' }, 500)
  }
})

/**
 * PUT /api/events/:id
 * 행사 수정 (관리자 전용)
 */
events.put('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<Partial<CreateEventRequest>>()
    const { name, start_date, end_date } = body

    const db = c.env.DB

    const result = await db
      .prepare('UPDATE events SET name = COALESCE(?, name), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(name || null, start_date || null, end_date || null, id)
      .run()

    if (!result.success) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    const updatedEvent = await db
      .prepare('SELECT * FROM events WHERE id = ?')
      .bind(id)
      .first()

    return c.json({ event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
    return c.json({ error: '행사 수정에 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/events/:id
 * 행사 삭제 (관리자 전용)
 */
events.delete('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    // 연관된 부스가 있는지 확인
    const boothCount = await db
      .prepare('SELECT COUNT(*) as count FROM booths WHERE event_id = ?')
      .bind(id)
      .first()

    if (boothCount && boothCount.count > 0) {
      return c.json({ 
        error: '이 행사에 등록된 부스가 있어 삭제할 수 없습니다.',
        message: '먼저 모든 부스를 삭제해주세요.'
      }, 400)
    }

    const result = await db
      .prepare('DELETE FROM events WHERE id = ?')
      .bind(id)
      .run()

    if (!result.success) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    return c.json({ message: '행사가 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return c.json({ error: '행사 삭제에 실패했습니다.' }, 500)
  }
})

/**
 * PATCH /api/events/:id/toggle
 * 행사 활성화/비활성화 (관리자 전용)
 */
events.patch('/:id/toggle', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    // 현재 상태 조회
    const event = await db
      .prepare('SELECT is_active FROM events WHERE id = ?')
      .bind(id)
      .first()

    if (!event) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    const newStatus = event.is_active ? 0 : 1

    await db
      .prepare('UPDATE events SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newStatus, id)
      .run()

    const updatedEvent = await db
      .prepare('SELECT * FROM events WHERE id = ?')
      .bind(id)
      .first()

    return c.json({ 
      message: `행사가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`,
      event: updatedEvent 
    })
  } catch (error) {
    console.error('Error toggling event:', error)
    return c.json({ error: '행사 상태 변경에 실패했습니다.' }, 500)
  }
})

export default events
