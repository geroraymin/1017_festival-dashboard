import { Hono } from 'hono'
import { type Env, getAll } from '../lib/d1'
import { authMiddleware, operatorOrAdmin, adminOnly } from '../middlewares/auth'
import type { CreateParticipantRequest } from '../types/database'

const participants = new Hono<{ Bindings: Env }>()

/**
 * POST /api/participants
 * 참가자 등록 (인증 불필요 - 부스 코드 확인 후 등록)
 */
participants.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateParticipantRequest>()
    const { booth_id, name, gender, grade, date_of_birth, has_consented } = body

    // 필수 필드 검증
    if (!booth_id || !name || !gender || !grade || !date_of_birth) {
      return c.json({ error: '모든 필수 항목을 입력해주세요.' }, 400)
    }

    // 동의 확인
    if (!has_consented) {
      return c.json({ error: '개인정보 수집 및 활용에 동의해주세요.' }, 400)
    }

    // 성별 검증 (기타 제거)
    if (!['남성', '여성'].includes(gender)) {
      return c.json({ error: '유효하지 않은 성별입니다.' }, 400)
    }

    // 교급 검증 (유아, 성인 추가)
    if (!['유아', '초등', '중등', '고등', '성인'].includes(grade)) {
      return c.json({ error: '유효하지 않은 교급입니다.' }, 400)
    }

    const db = c.env.DB

    // 부스 존재 및 활성화 상태 확인
    const boothResult = await db
      .prepare('SELECT id, is_active FROM booths WHERE id = ?')
      .bind(booth_id)
      .first()

    if (!boothResult) {
      return c.json({ error: '존재하지 않는 부스입니다.' }, 404)
    }

    if (!boothResult.is_active) {
      return c.json({ error: '현재 비활성화된 부스입니다.' }, 400)
    }

    // 중복 등록 체크 (이름 + 생년월일 + 부스 조합)
    const existingResult = await db
      .prepare('SELECT id, name, created_at FROM participants WHERE booth_id = ? AND name = ? AND date_of_birth = ?')
      .bind(booth_id, name, date_of_birth)
      .first()

    if (existingResult) {
      // 중복 등록 감지 - 이미 등록된 사용자
      const createdAt = new Date(existingResult.created_at as string)
      const timeDiff = Date.now() - createdAt.getTime()
      const minutesAgo = Math.floor(timeDiff / 60000)
      
      let timeMessage = ''
      if (minutesAgo < 1) {
        timeMessage = '방금 전'
      } else if (minutesAgo < 60) {
        timeMessage = `${minutesAgo}분 전`
      } else {
        const hoursAgo = Math.floor(minutesAgo / 60)
        timeMessage = `${hoursAgo}시간 전`
      }
      
      return c.json({ 
        error: `이미 등록된 참가자입니다.\n${existingResult.name}님은 ${timeMessage}에 등록하셨습니다.`,
        duplicate: true,
        existing_participant: {
          name: existingResult.name,
          created_at: existingResult.created_at
        }
      }, 409)
    }

    // 참가자 등록
    const insertResult = await db
      .prepare('INSERT INTO participants (booth_id, name, gender, grade, date_of_birth, has_consented) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(booth_id, name, gender, grade, date_of_birth, has_consented ? 1 : 0)
      .run()

    if (!insertResult.success) {
      console.error('Error creating participant:', insertResult)
      return c.json({ error: '참가자 등록에 실패했습니다.' }, 500)
    }

    // 방금 등록한 참가자 정보 조회
    const newParticipant = await db
      .prepare('SELECT * FROM participants WHERE id = ?')
      .bind(insertResult.meta.last_row_id)
      .first()

    return c.json({ 
      message: '방명록 작성이 완료되었습니다. 감사합니다!',
      participant: newParticipant 
    }, 201)
  } catch (error) {
    console.error('Participant creation error:', error)
    return c.json({ error: '참가자 등록에 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/participants
 * 참가자 목록 조회 (인증 필요)
 * 쿼리 파라미터: booth_id, event_id, limit, offset
 */
participants.get('/', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const boothId = c.req.query('booth_id')
    const eventId = c.req.query('event_id')
    const limit = parseInt(c.req.query('limit') || '100')
    const offset = parseInt(c.req.query('offset') || '0')

    const db = c.env.DB
    const user = c.get('user')

    // 운영자는 자신의 부스 참가자만 조회 가능
    if (user.role === 'operator' && user.booth_id) {
      const participantsResult = await db
        .prepare(`
          SELECT p.*, b.name as booth_name, b.booth_code 
          FROM participants p 
          LEFT JOIN booths b ON p.booth_id = b.id 
          WHERE p.booth_id = ? 
          ORDER BY p.created_at DESC 
          LIMIT ? OFFSET ?
        `)
        .bind(user.booth_id, limit, offset)
        .all()

      // 전체 카운트
      const countResult = await db
        .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ?')
        .bind(user.booth_id)
        .first()

      return c.json({
        participants: participantsResult.results || [],
        total: countResult?.count || 0,
        limit,
        offset
      })
    }

    // 관리자는 모든 참가자 조회 가능
    if (user.role === 'admin') {
      let query = `
        SELECT p.*, b.name as booth_name, b.booth_code 
        FROM participants p 
        LEFT JOIN booths b ON p.booth_id = b.id 
        WHERE 1=1
      `
      const bindings: any[] = []

      if (boothId) {
        query += ' AND p.booth_id = ?'
        bindings.push(boothId)
      }

      if (eventId) {
        query += ' AND b.event_id = ?'
        bindings.push(eventId)
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
      bindings.push(limit, offset)

      const participantsResult = await db
        .prepare(query)
        .bind(...bindings)
        .all()

      // 전체 카운트
      let countQuery = 'SELECT COUNT(*) as count FROM participants p LEFT JOIN booths b ON p.booth_id = b.id WHERE 1=1'
      const countBindings: any[] = []

      if (boothId) {
        countQuery += ' AND p.booth_id = ?'
        countBindings.push(boothId)
      }

      if (eventId) {
        countQuery += ' AND b.event_id = ?'
        countBindings.push(eventId)
      }

      const countResult = await db
        .prepare(countQuery)
        .bind(...countBindings)
        .first()

      return c.json({
        participants: participantsResult.results || [],
        total: countResult?.count || 0,
        limit,
        offset
      })
    }

    return c.json({ error: '권한이 없습니다.' }, 403)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return c.json({ error: '참가자 목록을 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/participants/:id
 * 참가자 삭제 (관리자 전용)
 */
participants.delete('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    const result = await db
      .prepare('DELETE FROM participants WHERE id = ?')
      .bind(id)
      .run()

    if (!result.success) {
      return c.json({ error: '참가자를 찾을 수 없습니다.' }, 404)
    }

    return c.json({ message: '참가자가 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting participant:', error)
    return c.json({ error: '참가자 삭제에 실패했습니다.' }, 500)
  }
})

export default participants
