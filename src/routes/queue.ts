import { Hono } from 'hono'
import { type Env } from '../lib/d1'
import { authMiddleware, operatorOrAdmin, adminOnly } from '../middlewares/auth'

const queue = new Hono<{ Bindings: Env }>()

/**
 * POST /api/queue/join
 * 대기열 참가 (방명록 작성 완료 후 자동 호출)
 * 인증 불필요 (공개 API)
 */
queue.post('/join', async (c) => {
  try {
    const { booth_id, participant_id } = await c.req.json()
    
    if (!booth_id || !participant_id) {
      return c.json({ error: '필수 정보가 누락되었습니다.' }, 400)
    }
    
    const db = c.env.DB
    
    // 부스 존재 확인
    const booth = await db
      .prepare('SELECT id, name FROM booths WHERE id = ?')
      .bind(booth_id)
      .first()
    
    if (!booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }
    
    // 해당 부스의 마지막 대기번호 조회
    const lastQueue = await db
      .prepare('SELECT MAX(queue_number) as last_number FROM queue WHERE booth_id = ?')
      .bind(booth_id)
      .first() as { last_number: number | null }
    
    const nextNumber = (lastQueue?.last_number || 0) + 1
    
    // 대기열 추가
    const result = await db
      .prepare(`
        INSERT INTO queue (booth_id, participant_id, queue_number, status)
        VALUES (?, ?, ?, 'waiting')
      `)
      .bind(booth_id, participant_id, nextNumber)
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
    
    return c.json({
      message: '대기번호가 발급되었습니다.',
      queue_id: result.meta.last_row_id,
      queue_number: nextNumber,
      current_number: currentNumber,
      waiting_count: waitingCount,
      booth_name: booth.name
    })
  } catch (error) {
    console.error('Queue join error:', error)
    return c.json({ error: '대기열 참가에 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/queue/status/:booth_id
 * 부스별 현재 대기 상황 조회
 * 인증 불필요 (디스플레이용)
 */
queue.get('/status/:booth_id', async (c) => {
  try {
    const boothId = c.req.param('booth_id')
    const db = c.env.DB
    
    // 현재 호출된 번호
    const currentQueue = await db
      .prepare(`
        SELECT queue_number 
        FROM queue 
        WHERE booth_id = ? AND status = 'called'
        ORDER BY called_at DESC
        LIMIT 1
      `)
      .bind(boothId)
      .first() as { queue_number: number } | null
    
    // 가장 최근 완료된 번호
    const lastCompleted = await db
      .prepare(`
        SELECT queue_number 
        FROM queue 
        WHERE booth_id = ? AND status = 'completed'
        ORDER BY completed_at DESC
        LIMIT 1
      `)
      .bind(boothId)
      .first() as { queue_number: number } | null
    
    // 대기 중인 인원 수
    const waitingResult = await db
      .prepare(`
        SELECT COUNT(*) as count 
        FROM queue 
        WHERE booth_id = ? AND status = 'waiting'
      `)
      .bind(boothId)
      .first() as { count: number }
    
    // 마지막 발급 번호
    const lastQueue = await db
      .prepare('SELECT MAX(queue_number) as last_number FROM queue WHERE booth_id = ?')
      .bind(boothId)
      .first() as { last_number: number | null }
    
    const currentNumber = currentQueue?.queue_number || lastCompleted?.queue_number || 0
    const lastNumber = lastQueue?.last_number || 0
    
    return c.json({
      current_number: currentNumber,
      last_number: lastNumber,
      waiting_count: waitingResult.count
    })
  } catch (error) {
    console.error('Queue status error:', error)
    return c.json({ error: '대기 상황 조회에 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/queue/my-status/:queue_id
 * 내 대기 상태 조회
 * 인증 불필요 (참가자용)
 */
queue.get('/my-status/:queue_id', async (c) => {
  try {
    const queueId = c.req.param('queue_id')
    const db = c.env.DB
    
    // 내 대기 정보
    const myQueue = await db
      .prepare(`
        SELECT q.queue_number, q.status, q.booth_id, b.name as booth_name
        FROM queue q
        LEFT JOIN booths b ON q.booth_id = b.id
        WHERE q.id = ?
      `)
      .bind(queueId)
      .first() as any
    
    if (!myQueue) {
      return c.json({ error: '대기 정보를 찾을 수 없습니다.' }, 404)
    }
    
    // 현재 진행 번호
    const currentQueue = await db
      .prepare(`
        SELECT queue_number 
        FROM queue 
        WHERE booth_id = ? AND status IN ('called', 'completed')
        ORDER BY queue_number DESC
        LIMIT 1
      `)
      .bind(myQueue.booth_id)
      .first() as { queue_number: number } | null
    
    const currentNumber = currentQueue?.queue_number || 0
    const remaining = Math.max(0, myQueue.queue_number - currentNumber - 1)
    
    // 정확히 내 차례인지 확인 (내 번호 = 현재 호출된 번호 + 1)
    const isMyTurn = myQueue.queue_number === currentNumber + 1 && myQueue.status === 'waiting'
    
    return c.json({
      queue_number: myQueue.queue_number,
      current_number: currentNumber,
      remaining: remaining,
      status: myQueue.status,
      booth_name: myQueue.booth_name,
      is_my_turn: isMyTurn
    })
  } catch (error) {
    console.error('My status error:', error)
    return c.json({ error: '대기 상태 조회에 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/queue/call-next
 * 다음 손님 호출 (운영자/관리자)
 */
queue.post('/call-next', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const { booth_id } = await c.req.json()
    
    if (!booth_id) {
      return c.json({ error: '부스 ID가 필요합니다.' }, 400)
    }
    
    const db = c.env.DB
    const user = c.get('user')
    
    // 권한 확인 (운영자는 자기 부스만)
    if (user.role === 'operator' && user.booth_id !== booth_id) {
      return c.json({ error: '다른 부스의 대기열을 관리할 수 없습니다.' }, 403)
    }
    
    // 현재 호출된 번호가 있으면 완료 처리
    const currentCalled = await db
      .prepare(`
        UPDATE queue 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE booth_id = ? AND status = 'called'
      `)
      .bind(booth_id)
      .run()
    
    // 다음 대기자 호출
    const nextQueue = await db
      .prepare(`
        SELECT id, queue_number, participant_id
        FROM queue
        WHERE booth_id = ? AND status = 'waiting'
        ORDER BY queue_number ASC
        LIMIT 1
      `)
      .bind(booth_id)
      .first() as any
    
    if (!nextQueue) {
      return c.json({ 
        message: '대기 중인 손님이 없습니다.',
        has_next: false
      })
    }
    
    // 상태 변경: waiting → called
    await db
      .prepare(`
        UPDATE queue 
        SET status = 'called', called_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(nextQueue.id)
      .run()
    
    // 참가자 정보 조회
    const participant = await db
      .prepare('SELECT name FROM participants WHERE id = ?')
      .bind(nextQueue.participant_id)
      .first() as { name: string } | null
    
    return c.json({
      message: '다음 손님을 호출했습니다.',
      queue_number: nextQueue.queue_number,
      participant_name: participant?.name,
      has_next: true
    })
  } catch (error) {
    console.error('Call next error:', error)
    return c.json({ error: '손님 호출에 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/queue/list/:booth_id
 * 대기열 목록 조회 (운영자/관리자)
 */
queue.get('/list/:booth_id', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const boothId = c.req.param('booth_id')
    const db = c.env.DB
    const user = c.get('user')
    
    // 권한 확인
    if (user.role === 'operator' && user.booth_id !== boothId) {
      return c.json({ error: '다른 부스의 대기열을 조회할 수 없습니다.' }, 403)
    }
    
    // 대기 중인 사람들
    const waitingList = await db
      .prepare(`
        SELECT q.id, q.queue_number, q.status, q.created_at,
               p.name as participant_name
        FROM queue q
        LEFT JOIN participants p ON q.participant_id = p.id
        WHERE q.booth_id = ? AND q.status = 'waiting'
        ORDER BY q.queue_number ASC
        LIMIT 20
      `)
      .bind(boothId)
      .all()
    
    // 현재 호출된 사람
    const current = await db
      .prepare(`
        SELECT q.id, q.queue_number, q.status, q.called_at,
               p.name as participant_name
        FROM queue q
        LEFT JOIN participants p ON q.participant_id = p.id
        WHERE q.booth_id = ? AND q.status = 'called'
        ORDER BY q.called_at DESC
        LIMIT 1
      `)
      .bind(boothId)
      .first()
    
    return c.json({
      current: current || null,
      waiting: waitingList.results || []
    })
  } catch (error) {
    console.error('Queue list error:', error)
    return c.json({ error: '대기열 조회에 실패했습니다.' }, 500)
  }
})

export default queue
