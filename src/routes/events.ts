import { Hono } from 'hono'
import { createSupabaseClient, type Env } from '../lib/supabase'
import { authMiddleware, adminOnly } from '../middlewares/auth'
import type { CreateEventRequest, Event } from '../types/database'

const events = new Hono<{ Bindings: Env }>()

// 모든 라우트에 인증 미들웨어 적용
events.use('/*', authMiddleware)

/**
 * GET /api/events
 * 모든 행사 목록 조회
 */
events.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return c.json({ error: '행사 목록을 불러오는데 실패했습니다.' }, 500)
    }

    return c.json({ events: data || [] })
  } catch (error) {
    console.error('Events fetch error:', error)
    return c.json({ error: '행사 목록을 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/events/:id
 * 특정 행사 상세 조회
 */
events.get('/:id', async (c) => {
  try {
    const eventId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)
    
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    return c.json({ event })
  } catch (error) {
    console.error('Event fetch error:', error)
    return c.json({ error: '행사 정보를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/events
 * 새 행사 생성 (관리자 전용)
 */
events.post('/', adminOnly, async (c) => {
  try {
    const body = await c.req.json<CreateEventRequest>()
    const { name, start_date, end_date } = body

    if (!name || !start_date || !end_date) {
      return c.json({ error: '행사명, 시작일, 종료일을 모두 입력해주세요.' }, 400)
    }

    // 날짜 유효성 검증
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)

    if (startDate > endDate) {
      return c.json({ error: '종료일은 시작일 이후여야 합니다.' }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    const { data, error } = await supabase
      .from('events')
      .insert([{ name, start_date, end_date }])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return c.json({ error: '행사 생성에 실패했습니다.' }, 500)
    }

    return c.json({ event: data }, 201)
  } catch (error) {
    console.error('Event creation error:', error)
    return c.json({ error: '행사 생성에 실패했습니다.' }, 500)
  }
})

/**
 * PUT /api/events/:id
 * 행사 정보 수정 (관리자 전용)
 */
events.put('/:id', adminOnly, async (c) => {
  try {
    const eventId = c.req.param('id')
    const body = await c.req.json<Partial<CreateEventRequest>>()
    const { name, start_date, end_date } = body

    if (!name && !start_date && !end_date) {
      return c.json({ error: '수정할 내용을 입력해주세요.' }, 400)
    }

    // 날짜 유효성 검증
    if (start_date && end_date) {
      const startDate = new Date(start_date)
      const endDate = new Date(end_date)

      if (startDate > endDate) {
        return c.json({ error: '종료일은 시작일 이후여야 합니다.' }, 400)
      }
    }

    const supabase = createSupabaseClient(c.env)
    const { data, error } = await supabase
      .from('events')
      .update({ name, start_date, end_date })
      .eq('id', eventId)
      .select()
      .single()

    if (error || !data) {
      console.error('Error updating event:', error)
      return c.json({ error: '행사 수정에 실패했습니다.' }, 500)
    }

    return c.json({ event: data })
  } catch (error) {
    console.error('Event update error:', error)
    return c.json({ error: '행사 수정에 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/events/:id
 * 행사 삭제 (관리자 전용)
 * CASCADE로 연결된 부스와 참가자도 함께 삭제됨
 */
events.delete('/:id', adminOnly, async (c) => {
  try {
    const eventId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      return c.json({ error: '행사 삭제에 실패했습니다.' }, 500)
    }

    return c.json({ message: '행사가 삭제되었습니다.' })
  } catch (error) {
    console.error('Event deletion error:', error)
    return c.json({ error: '행사 삭제에 실패했습니다.' }, 500)
  }
})

/**
 * PATCH /api/events/:id/toggle
 * 행사 활성화/비활성화 토글 (관리자 전용)
 */
events.patch('/:id/toggle', adminOnly, async (c) => {
  try {
    const eventId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    // 현재 상태 조회
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('is_active')
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    // 상태 반전
    const { data, error } = await supabase
      .from('events')
      .update({ is_active: !event.is_active })
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error toggling event:', error)
      return c.json({ error: '행사 상태 변경에 실패했습니다.' }, 500)
    }

    return c.json({ event: data })
  } catch (error) {
    console.error('Event toggle error:', error)
    return c.json({ error: '행사 상태 변경에 실패했습니다.' }, 500)
  }
})

export default events
