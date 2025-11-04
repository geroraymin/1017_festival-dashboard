import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'
import { type Env } from '../lib/d1'
import { authMiddleware, adminOnly } from '../middlewares/auth'
import type { CreateBoothRequest } from '../types/database'

const booths = new Hono<{ Bindings: Env }>()

// 부스 코드 생성기 (6자리 영숫자)
const generateBoothCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

/**
 * GET /api/booths/:id/public-stats
 * 공개 통계 조회 (인증 불필요 - 디스플레이용)
 */
booths.get('/:id/public-stats', async (c) => {
  try {
    const boothId = c.req.param('id')
    const db = c.env.DB

    // 부스 정보 조회
    const booth = await db
      .prepare('SELECT b.*, e.name as event_name FROM booths b LEFT JOIN events e ON b.event_id = e.id WHERE b.id = ?')
      .bind(boothId)
      .first()

    if (!booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    // 총 참가자 수
    const countResult = await db
      .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ?')
      .bind(boothId)
      .first()

    // 성별 분포
    const genderResult = await db
      .prepare('SELECT gender, COUNT(*) as count FROM participants WHERE booth_id = ? GROUP BY gender')
      .bind(boothId)
      .all()

    const genderDistribution: Record<string, number> = {}
    genderResult.results?.forEach((row: any) => {
      genderDistribution[row.gender] = row.count
    })

    // 교급 분포
    const allGrades = ['유아', '초등', '중등', '고등', '성인']
    const gradeDistribution: Record<string, number> = {}
    allGrades.forEach(grade => {
      gradeDistribution[grade] = 0
    })
    
    const gradeResult = await db
      .prepare('SELECT grade, COUNT(*) as count FROM participants WHERE booth_id = ? GROUP BY grade')
      .bind(boothId)
      .all()

    gradeResult.results?.forEach((row: any) => {
      if (allGrades.includes(row.grade)) {
        gradeDistribution[row.grade] = row.count
      }
    })

    return c.json({
      booth: {
        name: booth.name,
        event_name: booth.event_name || '행사'
      },
      stats: {
        total_participants: countResult?.count || 0,
        gender_distribution: genderDistribution,
        grade_distribution: gradeDistribution
      }
    })
  } catch (error) {
    console.error('Public stats error:', error)
    return c.json({ error: '통계를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/booths/find-code
 * 부스 코드 찾기 (인증 불필요)
 */
booths.post('/find-code', async (c) => {
  try {
    const body = await c.req.json<{ booth_name: string; event_id?: string }>()
    const { booth_name, event_id } = body

    if (!booth_name || booth_name.trim().length < 2) {
      return c.json({ error: '부스명을 2자 이상 입력해주세요.' }, 400)
    }

    const db = c.env.DB
    let query = 'SELECT id, name, booth_code, event_id FROM booths WHERE is_active = 1 AND name LIKE ?'
    const bindings: any[] = [`%${booth_name.trim()}%`]

    if (event_id) {
      query += ' AND event_id = ?'
      bindings.push(event_id)
    }

    query += ' LIMIT 10'

    const result = await db
      .prepare(query)
      .bind(...bindings)
      .all()

    if (!result.results || result.results.length === 0) {
      return c.json({ 
        error: '검색 결과가 없습니다.',
        message: '부스명을 다시 확인해주세요. 정확한 부스명을 모르시면 관리자에게 문의하세요.'
      }, 404)
    }

    return c.json({ booths: result.results })
  } catch (error) {
    console.error('Find booth code error:', error)
    return c.json({ error: '부스 코드 검색에 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/booths
 * 부스 목록 조회
 */
booths.get('/', authMiddleware, async (c) => {
  try {
    const eventId = c.req.query('event_id')
    const db = c.env.DB

    let query = 'SELECT * FROM booths WHERE 1=1'
    const bindings: any[] = []

    if (eventId) {
      query += ' AND event_id = ?'
      bindings.push(eventId)
    }

    query += ' ORDER BY created_at DESC'

    const result = await db
      .prepare(query)
      .bind(...bindings)
      .all()

    return c.json({ booths: result.results || [] })
  } catch (error) {
    console.error('Error fetching booths:', error)
    return c.json({ error: '부스 목록을 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/booths/:id
 * 부스 상세 조회
 */
booths.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    const booth = await db
      .prepare('SELECT * FROM booths WHERE id = ?')
      .bind(id)
      .first()

    if (!booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    return c.json({ booth })
  } catch (error) {
    console.error('Error fetching booth:', error)
    return c.json({ error: '부스를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/booths
 * 부스 생성 (관리자 전용)
 */
booths.post('/', authMiddleware, adminOnly, async (c) => {
  try {
    const body = await c.req.json<CreateBoothRequest>()
    const { event_id, name, description } = body

    if (!event_id || !name) {
      return c.json({ error: '행사와 부스명은 필수입니다.' }, 400)
    }

    const db = c.env.DB

    // 이벤트 존재 확인
    const event = await db
      .prepare('SELECT id FROM events WHERE id = ?')
      .bind(event_id)
      .first()

    if (!event) {
      return c.json({ error: '존재하지 않는 행사입니다.' }, 404)
    }

    // 부스 코드 생성 (중복 체크)
    let boothCode = generateBoothCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await db
        .prepare('SELECT id FROM booths WHERE booth_code = ?')
        .bind(boothCode)
        .first()

      if (!existing) break
      boothCode = generateBoothCode()
      attempts++
    }

    // 부스 생성
    const result = await db
      .prepare('INSERT INTO booths (event_id, name, booth_code, description) VALUES (?, ?, ?, ?)')
      .bind(event_id, name, boothCode, description || null)
      .run()

    if (!result.success) {
      return c.json({ error: '부스 생성에 실패했습니다.' }, 500)
    }

    const newBooth = await db
      .prepare('SELECT * FROM booths WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first()

    return c.json({ booth: newBooth }, 201)
  } catch (error) {
    console.error('Error creating booth:', error)
    return c.json({ error: '부스 생성에 실패했습니다.' }, 500)
  }
})

/**
 * PUT /api/booths/:id
 * 부스 수정 (관리자 전용)
 */
booths.put('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<Partial<CreateBoothRequest>>()
    const { name, description } = body

    const db = c.env.DB

    const result = await db
      .prepare('UPDATE booths SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(name || null, description || null, id)
      .run()

    if (!result.success) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    const updatedBooth = await db
      .prepare('SELECT * FROM booths WHERE id = ?')
      .bind(id)
      .first()

    return c.json({ booth: updatedBooth })
  } catch (error) {
    console.error('Error updating booth:', error)
    return c.json({ error: '부스 수정에 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/booths/:id
 * 부스 삭제 (관리자 전용)
 */
booths.delete('/:id', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    const result = await db
      .prepare('DELETE FROM booths WHERE id = ?')
      .bind(id)
      .run()

    if (!result.success) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    return c.json({ message: '부스가 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting booth:', error)
    return c.json({ error: '부스 삭제에 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/booths/:id/regenerate-code
 * 부스 코드 재발급 (관리자 전용)
 */
booths.post('/:id/regenerate-code', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    // 새 부스 코드 생성
    let newCode = generateBoothCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await db
        .prepare('SELECT id FROM booths WHERE booth_code = ?')
        .bind(newCode)
        .first()

      if (!existing) break
      newCode = generateBoothCode()
      attempts++
    }

    const result = await db
      .prepare('UPDATE booths SET booth_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newCode, id)
      .run()

    if (!result.success) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    const updatedBooth = await db
      .prepare('SELECT * FROM booths WHERE id = ?')
      .bind(id)
      .first()

    return c.json({ 
      message: '부스 코드가 재발급되었습니다.',
      booth: updatedBooth 
    })
  } catch (error) {
    console.error('Error regenerating booth code:', error)
    return c.json({ error: '부스 코드 재발급에 실패했습니다.' }, 500)
  }
})

/**
 * PATCH /api/booths/:id/toggle
 * 부스 활성화/비활성화 (관리자 전용)
 */
booths.patch('/:id/toggle', authMiddleware, adminOnly, async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB

    // 현재 상태 조회
    const booth = await db
      .prepare('SELECT is_active FROM booths WHERE id = ?')
      .bind(id)
      .first()

    if (!booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    const newStatus = booth.is_active ? 0 : 1

    await db
      .prepare('UPDATE booths SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newStatus, id)
      .run()

    const updatedBooth = await db
      .prepare('SELECT * FROM booths WHERE id = ?')
      .bind(id)
      .first()

    return c.json({ 
      message: `부스가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`,
      booth: updatedBooth 
    })
  } catch (error) {
    console.error('Error toggling booth:', error)
    return c.json({ error: '부스 상태 변경에 실패했습니다.' }, 500)
  }
})

export default booths
