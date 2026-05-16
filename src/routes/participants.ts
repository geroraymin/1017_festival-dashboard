import { Hono } from 'hono'
import { type Env, getAll } from '../lib/d1'
import { authMiddleware, operatorOrAdmin } from '../middlewares/auth'
import type { CreateParticipantRequest } from '../types/database'

const participants = new Hono<{ Bindings: Env }>()

async function getParticipantAccessRow(db: any, id: string) {
  return db
    .prepare('SELECT id, booth_id FROM participants WHERE id = ?')
    .bind(id)
    .first()
}

function canManageParticipant(user: any, participant: any) {
  if (user.role === 'admin') return true
  return user.role === 'operator' && String(user.booth_id) === String(participant.booth_id)
}

const visitScopeSql = `
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM participants earlier
      WHERE earlier.name = p.name
        AND earlier.gender = p.gender
        AND earlier.grade = p.grade
        AND earlier.date_of_birth = p.date_of_birth
        AND earlier.booth_id = p.booth_id
        AND (
          datetime(earlier.created_at) < datetime(p.created_at)
          OR (datetime(earlier.created_at) = datetime(p.created_at) AND earlier.id < p.id)
        )
    ) THEN 'same_booth'
    WHEN EXISTS (
      SELECT 1
      FROM participants earlier
      LEFT JOIN booths earlier_booth ON earlier.booth_id = earlier_booth.id
      WHERE earlier.name = p.name
        AND earlier.gender = p.gender
        AND earlier.grade = p.grade
        AND earlier.date_of_birth = p.date_of_birth
        AND earlier.booth_id != p.booth_id
        AND earlier_booth.event_id = b.event_id
        AND (
          datetime(earlier.created_at) < datetime(p.created_at)
          OR (datetime(earlier.created_at) = datetime(p.created_at) AND earlier.id < p.id)
        )
    ) THEN 'same_event_other_booth'
    WHEN EXISTS (
      SELECT 1
      FROM participants earlier
      LEFT JOIN booths earlier_booth ON earlier.booth_id = earlier_booth.id
      WHERE earlier.name = p.name
        AND earlier.gender = p.gender
        AND earlier.grade = p.grade
        AND earlier.date_of_birth = p.date_of_birth
        AND earlier_booth.event_id != b.event_id
        AND (
          datetime(earlier.created_at) < datetime(p.created_at)
          OR (datetime(earlier.created_at) = datetime(p.created_at) AND earlier.id < p.id)
        )
    ) THEN 'other_event'
    ELSE 'first'
  END
`

function withVisitLabel(participant: any) {
  const labels: Record<string, string> = {
    first: '첫방문',
    same_booth: '같은 부스 재방문',
    same_event_other_booth: '행사 내 타부스 방문',
    other_event: '다른 행사 방문자',
  }

  return {
    ...participant,
    visit_label: labels[participant.visit_scope] || '첫방문',
  }
}

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
      .prepare('SELECT id, event_id, is_active FROM booths WHERE id = ?')
      .bind(booth_id)
      .first()

    if (!boothResult) {
      return c.json({ error: '존재하지 않는 부스입니다.' }, 404)
    }

    if (!boothResult.is_active) {
      return c.json({ error: '현재 비활성화된 부스입니다.' }, 400)
    }

    // 이전 방문 이력 확인: 이름, 성별, 교급, 생년월일이 모두 같을 때만 재방문으로 간주
    const previousVisit = await db
      .prepare(`
        SELECT p.id, p.name, p.created_at, b.name as booth_name, b.id as previous_booth_id, b.event_id as previous_event_id
        FROM participants p
        LEFT JOIN booths b ON p.booth_id = b.id
        WHERE p.name = ? AND p.gender = ? AND p.grade = ? AND p.date_of_birth = ?
        ORDER BY p.created_at DESC
        LIMIT 1
      `)
      .bind(name, gender, grade, date_of_birth)
      .first()

    // is_duplicate 플래그 결정 (이전 방문 이력이 있으면 1, 없으면 0)
    const isDuplicate = previousVisit ? 1 : 0
    
    // 동일 부스 재방문인지 확인
    const isSameBooth = previousVisit && previousVisit.previous_booth_id === booth_id

    // 참가자 등록 (is_duplicate 플래그 포함)
    const insertResult = await db
      .prepare('INSERT INTO participants (booth_id, name, gender, grade, date_of_birth, has_consented, is_duplicate) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(booth_id, name, gender, grade, date_of_birth, has_consented ? 1 : 0, isDuplicate)
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

    // 대기열 자동 참가
    let queueInfo = null
    
    try {
      // 해당 부스의 마지막 대기번호 조회
      const lastQueue = await db
        .prepare('SELECT MAX(queue_number) as last_number FROM queue WHERE booth_id = ?')
        .bind(booth_id)
        .first() as { last_number: number | null }
      
      const nextNumber = (lastQueue?.last_number || 0) + 1
      
      // 대기열 추가
      const queueResult = await db
        .prepare(`
          INSERT INTO queue (booth_id, participant_id, queue_number, status)
          VALUES (?, ?, ?, 'waiting')
        `)
        .bind(booth_id, insertResult.meta.last_row_id, nextNumber)
        .run()
      
      // 현재 진행 중인 번호 조회
      const currentQueue = await db
        .prepare(`
          SELECT queue_number 
          FROM queue 
          WHERE booth_id = ? AND status IN ('called', 'completed')
          ORDER BY queue_number DESC
          LIMIT 1
        `)
        .bind(booth_id)
        .first() as { queue_number: number } | null
      
      const currentNumber = currentQueue?.queue_number || 0
      const waitingCount = nextNumber - currentNumber
      
      queueInfo = {
        queue_id: queueResult.meta.last_row_id,
        queue_number: nextNumber,
        current_number: currentNumber,
        waiting_count: waitingCount
      }
    } catch (queueError) {
      console.error('Queue join error:', queueError)
      // 대기열 참가 실패해도 참가자 등록은 성공으로 처리
    }
    
    // 응답 메시지 구성 (재방문자 환영 메시지)
    let message = '방명록 작성이 완료되었습니다. 감사합니다!'
    let isRevisit = false
    let previousBoothName = ''
    let visitScope = 'first'
    let visitLabel = '첫방문'

    if (previousVisit) {
      isRevisit = true
      previousBoothName = previousVisit.booth_name as string
      visitScope = isSameBooth
        ? 'same_booth'
        : String(previousVisit.previous_event_id) === String(boothResult.event_id)
          ? 'same_event_other_booth'
          : 'other_event'
      visitLabel = {
        same_booth: '같은 부스 재방문',
        same_event_other_booth: '행사 내 타부스 방문',
        other_event: '다른 행사 방문자',
      }[visitScope] || '재방문'
      
      const createdAt = new Date(previousVisit.created_at as string)
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

      if (isSameBooth) {
        // 동일 부스 재방문
        message = `다시 방문해주셔서 감사합니다! 🎉\n이 부스에 ${timeMessage} 방문하셨습니다.`
      } else if (visitScope === 'same_event_other_booth') {
        message = `방문해주셔서 감사합니다! 🎉\n[현재 행사 내 이전 방문] ${previousBoothName} (${timeMessage})`
      } else {
        message = `방문해주셔서 감사합니다! 🎉\n[다른 행사 이전 방문] ${previousBoothName} (${timeMessage})`
      }
    }

    return c.json({ 
      message,
      participant: newParticipant,
      is_revisit: isRevisit,
      visit_scope: visitScope,
      visit_label: visitLabel,
      previous_booth: previousBoothName || null,
      queue: queueInfo
    }, 201)
  } catch (error) {
    console.error('Participant creation error:', error)
    return c.json({ error: '참가자 등록에 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/participants
 * 참가자 목록 조회 (인증 필요)
 * 쿼리 파라미터: booth_id, event_id, date, limit, offset
 */
participants.get('/', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const boothId = c.req.query('booth_id')
    const eventId = c.req.query('event_id')
    const date = c.req.query('date')
    const limit = parseInt(c.req.query('limit') || '100000')
    const offset = parseInt(c.req.query('offset') || '0')

    const db = c.env.DB
    const user = c.get('user')

    // 운영자는 자신의 부스 참가자만 조회 가능
    if (user.role === 'operator' && user.booth_id) {
      let operatorQuery = `
          SELECT p.*, b.name as booth_name, b.booth_code, b.event_id,
                 e.name as event_name,
                 datetime(p.created_at, '+9 hours') as created_at_kst,
                 ${visitScopeSql} as visit_scope
          FROM participants p 
          LEFT JOIN booths b ON p.booth_id = b.id 
          LEFT JOIN events e ON b.event_id = e.id
          WHERE p.booth_id = ?
      `
      const operatorBindings: any[] = [user.booth_id]

      if (date) {
        operatorQuery += " AND date(datetime(p.created_at, '+9 hours')) = ?"
        operatorBindings.push(date)
      }

      operatorQuery += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
      operatorBindings.push(limit, offset)

      const participantsResult = await db
        .prepare(operatorQuery)
        .bind(...operatorBindings)
        .all()

      // 전체 카운트
      let operatorCountQuery = 'SELECT COUNT(*) as count FROM participants WHERE booth_id = ?'
      const operatorCountBindings: any[] = [user.booth_id]

      if (date) {
        operatorCountQuery += " AND date(datetime(created_at, '+9 hours')) = ?"
        operatorCountBindings.push(date)
      }

      const countResult = await db
        .prepare(operatorCountQuery)
        .bind(...operatorCountBindings)
        .first()

      return c.json({
        participants: (participantsResult.results || []).map(withVisitLabel),
        total: countResult?.count || 0,
        limit,
        offset
      })
    }

    // 관리자는 모든 참가자 조회 가능
    if (user.role === 'admin') {
      let query = `
        SELECT p.*, b.name as booth_name, b.booth_code, b.event_id,
               e.name as event_name,
               datetime(p.created_at, '+9 hours') as created_at_kst,
               ${visitScopeSql} as visit_scope
        FROM participants p 
        LEFT JOIN booths b ON p.booth_id = b.id 
        LEFT JOIN events e ON b.event_id = e.id
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

      if (date) {
        query += " AND date(datetime(p.created_at, '+9 hours')) = ?"
        bindings.push(date)
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

      if (date) {
        countQuery += " AND date(datetime(p.created_at, '+9 hours')) = ?"
        countBindings.push(date)
      }

      const countResult = await db
        .prepare(countQuery)
        .bind(...countBindings)
        .first()

      return c.json({
        participants: (participantsResult.results || []).map(withVisitLabel),
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
 * PATCH /api/participants/:id/attendance
 * 참가자 실제 참석 확인 상태 변경
 * 관리자: 전체 가능, 운영자: 자기 부스 참가자만 가능
 */
participants.patch('/:id/attendance', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<{ attended?: boolean }>()
    const attended = body.attended ? 1 : 0
    const db = c.env.DB
    const user = c.get('user')

    const participantAccess = await getParticipantAccessRow(db, id)
    if (!participantAccess) {
      return c.json({ error: '참가자를 찾을 수 없습니다.' }, 404)
    }

    if (!canManageParticipant(user, participantAccess)) {
      return c.json({ error: '권한이 없습니다.' }, 403)
    }

    const result = await db
      .prepare(`
        UPDATE participants
        SET attended = ?, attended_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
        WHERE id = ?
      `)
      .bind(attended, attended, id)
      .run()

    if (!result.success || result.meta.changes === 0) {
      return c.json({ error: '참가자를 찾을 수 없습니다.' }, 404)
    }

    const participant = await db
      .prepare('SELECT * FROM participants WHERE id = ?')
      .bind(id)
      .first()

    return c.json({
      message: attended ? '참석으로 체크했습니다.' : '참석 체크를 해제했습니다.',
      participant
    })
  } catch (error) {
    console.error('Error updating participant attendance:', error)
    return c.json({ error: '참석 상태 변경에 실패했습니다.' }, 500)
  }
})

/**
 * PATCH /api/participants/:id
 * 참가자 정보 수정
 * 관리자: 전체 가능, 운영자: 자기 부스 참가자만 가능
 */
participants.patch('/:id', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<{
      name?: string
      gender?: string
      grade?: string
      date_of_birth?: string
    }>()
    const db = c.env.DB
    const user = c.get('user')

    const participantAccess = await getParticipantAccessRow(db, id)
    if (!participantAccess) {
      return c.json({ error: '참가자를 찾을 수 없습니다.' }, 404)
    }

    if (!canManageParticipant(user, participantAccess)) {
      return c.json({ error: '권한이 없습니다.' }, 403)
    }

    const name = (body.name || '').trim()
    const { gender, grade, date_of_birth } = body

    if (!name || !gender || !grade || !date_of_birth) {
      return c.json({ error: '모든 필수 항목을 입력해주세요.' }, 400)
    }

    if (!['남성', '여성'].includes(gender)) {
      return c.json({ error: '유효하지 않은 성별입니다.' }, 400)
    }

    if (!['유아', '초등', '중등', '고등', '성인'].includes(grade)) {
      return c.json({ error: '유효하지 않은 교급입니다.' }, 400)
    }

    const result = await db
      .prepare(`
        UPDATE participants
        SET name = ?, gender = ?, grade = ?, date_of_birth = ?
        WHERE id = ?
      `)
      .bind(name, gender, grade, date_of_birth, id)
      .run()

    if (!result.success || result.meta.changes === 0) {
      return c.json({ error: '참가자 정보 수정에 실패했습니다.' }, 500)
    }

    const participant = await db
      .prepare(`
        SELECT p.*, b.name as booth_name, b.booth_code, b.event_id,
               e.name as event_name,
               datetime(p.created_at, '+9 hours') as created_at_kst,
               ${visitScopeSql} as visit_scope
        FROM participants p
        LEFT JOIN booths b ON p.booth_id = b.id
        LEFT JOIN events e ON b.event_id = e.id
        WHERE p.id = ?
      `)
      .bind(id)
      .first()

    return c.json({
      message: '참가자 정보가 수정되었습니다.',
      participant: participant ? withVisitLabel(participant) : null
    })
  } catch (error) {
    console.error('Error updating participant:', error)
    return c.json({ error: '참가자 정보 수정에 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/participants/:id
 * 참가자 삭제
 * 관리자: 전체 가능, 운영자: 자기 부스 참가자만 가능
 */
participants.delete('/:id', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    const user = c.get('user')

    const participantAccess = await getParticipantAccessRow(db, id)
    if (!participantAccess) {
      return c.json({ error: '참가자를 찾을 수 없습니다.' }, 404)
    }

    if (!canManageParticipant(user, participantAccess)) {
      return c.json({ error: '권한이 없습니다.' }, 403)
    }

    await db
      .prepare('DELETE FROM queue WHERE participant_id = ?')
      .bind(id)
      .run()

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

/**
 * DELETE /api/participants/reset
 * 참가자 명단 전체 리셋 (운영자 또는 관리자)
 * 운영자: 자신의 부스 참가자만 삭제
 * 관리자: booth_id 파라미터로 특정 부스 또는 전체 삭제
 */
participants.delete('/reset/all', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const boothId = c.req.query('booth_id')

    // 운영자는 자신의 부스 참가자만 삭제
    if (user.role === 'operator' && user.booth_id) {
      // 해당 부스의 대기열 먼저 삭제
      await db
        .prepare('DELETE FROM queue WHERE booth_id = ?')
        .bind(user.booth_id)
        .run()

      // 참가자 삭제
      const result = await db
        .prepare('DELETE FROM participants WHERE booth_id = ?')
        .bind(user.booth_id)
        .run()

      return c.json({ 
        message: '참가자 명단이 초기화되었습니다.',
        deleted_count: result.meta.changes || 0
      })
    }

    // 관리자는 특정 부스 또는 전체 삭제 가능
    if (user.role === 'admin') {
      if (boothId) {
        // 특정 부스 삭제
        await db
          .prepare('DELETE FROM queue WHERE booth_id = ?')
          .bind(boothId)
          .run()

        const result = await db
          .prepare('DELETE FROM participants WHERE booth_id = ?')
          .bind(boothId)
          .run()

        return c.json({ 
          message: '해당 부스의 참가자 명단이 초기화되었습니다.',
          deleted_count: result.meta.changes || 0
        })
      } else {
        // 전체 삭제
        await db
          .prepare('DELETE FROM queue')
          .run()

        const result = await db
          .prepare('DELETE FROM participants')
          .run()

        return c.json({ 
          message: '모든 참가자 명단이 초기화되었습니다.',
          deleted_count: result.meta.changes || 0
        })
      }
    }

    return c.json({ error: '권한이 없습니다.' }, 403)
  } catch (error) {
    console.error('Error resetting participants:', error)
    return c.json({ error: '참가자 명단 초기화에 실패했습니다.' }, 500)
  }
})

export default participants
