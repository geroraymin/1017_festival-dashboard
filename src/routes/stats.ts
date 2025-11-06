import { Hono } from 'hono'
import { type Env } from '../lib/d1'
import { authMiddleware, operatorOrAdmin } from '../middlewares/auth'

const stats = new Hono<{ Bindings: Env }>()

// 모든 라우트에 인증 미들웨어 적용
stats.use('/*', authMiddleware, operatorOrAdmin)

/**
 * GET /api/stats/booth/:booth_id
 * 특정 부스의 통계 조회
 */
stats.get('/booth/:booth_id', async (c) => {
  try {
    const boothId = c.req.param('booth_id')
    const user = c.get('user')

    // 운영자는 자신의 부스만 조회 가능
    if (user.role === 'operator' && user.booth_id !== boothId) {
      return c.json({ error: '권한이 없습니다.' }, 403)
    }

    const db = c.env.DB

    // 부스 정보 조회
    const booth = await db
      .prepare('SELECT id, name, booth_code FROM booths WHERE id = ?')
      .bind(boothId)
      .first()

    if (!booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    // 연인원 (총 방문 수)
    const totalResult = await db
      .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ?')
      .bind(boothId)
      .first()

    // 실인원 (고유 참가자 수 - is_duplicate = 0인 경우만)
    const uniqueResult = await db
      .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ? AND is_duplicate = 0')
      .bind(boothId)
      .first()

    // 성별 분포
    const genderResult = await db
      .prepare(`
        SELECT gender, COUNT(*) as count 
        FROM participants 
        WHERE booth_id = ? 
        GROUP BY gender
      `)
      .bind(boothId)
      .all()

    const genderDistribution: Record<string, number> = { '남성': 0, '여성': 0 }
    genderResult.results?.forEach((row: any) => {
      genderDistribution[row.gender] = row.count
    })

    // 교급 분포
    const gradeResult = await db
      .prepare(`
        SELECT grade, COUNT(*) as count 
        FROM participants 
        WHERE booth_id = ? 
        GROUP BY grade
      `)
      .bind(boothId)
      .all()

    const gradeDistribution: Record<string, number> = {
      '유아': 0,
      '초등': 0,
      '중등': 0,
      '고등': 0,
      '성인': 0
    }
    gradeResult.results?.forEach((row: any) => {
      if (row.grade in gradeDistribution) {
        gradeDistribution[row.grade] = row.count
      }
    })

    // 시간대별 분포
    const hourlyResult = await db
      .prepare(`
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as count 
        FROM participants 
        WHERE booth_id = ? 
        GROUP BY hour
        ORDER BY hour
      `)
      .bind(boothId)
      .all()

    const hourlyDistribution: Record<string, number> = {}
    hourlyResult.results?.forEach((row: any) => {
      const hourKey = `${row.hour}:00`
      hourlyDistribution[hourKey] = row.count
    })

    const totalCount = totalResult?.count || 0
    const uniqueCount = uniqueResult?.count || 0

    return c.json({
      stats: {
        booth_id: booth.id,
        booth_name: booth.name,
        total_participants: totalCount,  // 연인원
        unique_participants: uniqueCount,  // 실인원
        duplicate_visits: totalCount - uniqueCount,  // 중복 방문 수
        gender_distribution: genderDistribution,
        grade_distribution: gradeDistribution,
        hourly_distribution: hourlyDistribution
      }
    })
  } catch (error) {
    console.error('Booth stats error:', error)
    return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/stats/event/:event_id
 * 특정 행사의 통계 조회 (관리자 전용)
 */
stats.get('/event/:event_id', async (c) => {
  try {
    const user = c.get('user')

    if (user.role !== 'admin') {
      return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
    }

    const eventId = c.req.param('event_id')
    const db = c.env.DB

    // 행사 정보 조회
    const event = await db
      .prepare('SELECT id, name FROM events WHERE id = ?')
      .bind(eventId)
      .first()

    if (!event) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    // 행사의 모든 부스 조회
    const boothsResult = await db
      .prepare('SELECT id, name FROM booths WHERE event_id = ?')
      .bind(eventId)
      .all()

    const booths = boothsResult.results || []

    // 각 부스별 통계 계산
    const boothsStats = await Promise.all(
      booths.map(async (booth: any) => {
        // 연인원 (총 방문 수)
        const totalResult = await db
          .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ?')
          .bind(booth.id)
          .first()

        // 실인원 (고유 참가자 수)
        const uniqueResult = await db
          .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ? AND is_duplicate = 0')
          .bind(booth.id)
          .first()

        // 성별 분포
        const genderResult = await db
          .prepare('SELECT gender, COUNT(*) as count FROM participants WHERE booth_id = ? GROUP BY gender')
          .bind(booth.id)
          .all()

        const genderDistribution: Record<string, number> = { '남성': 0, '여성': 0 }
        genderResult.results?.forEach((row: any) => {
          genderDistribution[row.gender] = row.count
        })

        // 교급 분포
        const gradeResult = await db
          .prepare('SELECT grade, COUNT(*) as count FROM participants WHERE booth_id = ? GROUP BY grade')
          .bind(booth.id)
          .all()

        const gradeDistribution: Record<string, number> = {
          '유아': 0,
          '초등': 0,
          '중등': 0,
          '고등': 0,
          '성인': 0
        }
        gradeResult.results?.forEach((row: any) => {
          if (row.grade in gradeDistribution) {
            gradeDistribution[row.grade] = row.count
          }
        })

        const totalCount = totalResult?.count || 0
        const uniqueCount = uniqueResult?.count || 0

        return {
          id: booth.id,
          name: booth.name,
          total_participants: totalCount,  // 연인원
          unique_participants: uniqueCount,  // 실인원
          duplicate_visits: totalCount - uniqueCount,  // 중복 방문 수
          gender_distribution: genderDistribution,
          grade_distribution: gradeDistribution
        }
      })
    )

    const totalParticipants = boothsStats.reduce((sum, b) => sum + b.total_participants, 0)

    return c.json({
      stats: {
        event_id: event.id,
        event_name: event.name,
        total_participants: totalParticipants,
        booth_count: booths.length,
        booths: boothsStats
      }
    })
  } catch (error) {
    console.error('Event stats error:', error)
    return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/stats/all
 * 전체 통계 조회 (관리자 전용)
 */
stats.get('/all', async (c) => {
  try {
    const user = c.get('user')

    if (user.role !== 'admin') {
      return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
    }

    const db = c.env.DB

    // 모든 활성 행사 조회 (is_active = 1)
    const eventsResult = await db
      .prepare('SELECT id, name, start_date, end_date FROM events WHERE is_active = 1')
      .all()

    const events = eventsResult.results || []

    // 각 행사별 통계 (부스별 상세 포함)
    const eventStats = await Promise.all(
      events.map(async (event: any) => {
        // 행사의 모든 부스 조회
        const boothsResult = await db
          .prepare('SELECT id, name, booth_code FROM booths WHERE event_id = ?')
          .bind(event.id)
          .all()

        const booths = boothsResult.results || []

        // 각 부스별 통계 계산
        const boothsStats = await Promise.all(
          booths.map(async (booth: any) => {
            // 연인원 (총 방문 수)
            const totalResult = await db
              .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ?')
              .bind(booth.id)
              .first()

            // 실인원 (고유 참가자 수)
            const uniqueResult = await db
              .prepare('SELECT COUNT(*) as count FROM participants WHERE booth_id = ? AND is_duplicate = 0')
              .bind(booth.id)
              .first()

            // 성별 분포
            const genderResult = await db
              .prepare('SELECT gender, COUNT(*) as count FROM participants WHERE booth_id = ? GROUP BY gender')
              .bind(booth.id)
              .all()

            const genderDistribution: Record<string, number> = { '남성': 0, '여성': 0 }
            genderResult.results?.forEach((row: any) => {
              genderDistribution[row.gender] = row.count
            })

            // 교급 분포
            const gradeResult = await db
              .prepare('SELECT grade, COUNT(*) as count FROM participants WHERE booth_id = ? GROUP BY grade')
              .bind(booth.id)
              .all()

            const gradeDistribution: Record<string, number> = {
              '유아': 0,
              '초등': 0,
              '중등': 0,
              '고등': 0,
              '성인': 0
            }
            gradeResult.results?.forEach((row: any) => {
              if (row.grade in gradeDistribution) {
                gradeDistribution[row.grade] = row.count
              }
            })

            const participantCount = totalResult?.count || 0
            const uniqueCount = uniqueResult?.count || 0

            return {
              id: booth.id,
              name: booth.name,
              booth_name: booth.name,
              booth_code: booth.booth_code,
              total_participants: participantCount,  // 연인원
              participant_count: participantCount,  // 프론트엔드 호환성 (연인원)
              unique_participants: uniqueCount,  // 실인원
              duplicate_visits: participantCount - uniqueCount,  // 중복 방문 수
              gender_distribution: genderDistribution,
              grade_distribution: gradeDistribution
            }
          })
        )

        const totalParticipants = boothsStats.reduce((sum, b) => sum + b.total_participants, 0)

        return {
          id: event.id,
          event_id: event.id,  // 프론트엔드 호환성
          name: event.name,
          event_name: event.name,  // 프론트엔드 호환성
          start_date: event.start_date,
          end_date: event.end_date,
          booth_count: booths.length,
          booths: boothsStats
        }
      })
    )

    const grandTotal = eventStats.reduce((sum: number, e: any) => sum + e.booth_count, 0)

    return c.json({
      events: eventStats,
      total_participants: eventStats.reduce((sum: number, e: any) => 
        sum + e.booths.reduce((s: number, b: any) => s + b.total_participants, 0), 0
      ),
      total_booths: grandTotal
    })
  } catch (error) {
    console.error('All stats error:', error)
    return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
  }
})

export default stats
