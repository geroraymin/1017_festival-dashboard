/**
 * 공개 통계 API (인증 불필요)
 * 디스플레이 페이지에서 사용
 */
import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'

type Env = {
  DB: D1Database
}

const publicStats = new Hono<{ Bindings: Env }>()

/**
 * GET /api/public/stats/booth/:booth_id
 * 부스 통계 조회 (인증 불필요)
 */
publicStats.get('/booth/:booth_id', async (c) => {
  try {
    const boothId = c.req.param('booth_id')
    const db = c.env.DB

    // 부스 정보 조회
    const boothQuery = await db
      .prepare('SELECT id, name, booth_code FROM booths WHERE id = ?')
      .bind(boothId)
      .first()

    if (!boothQuery) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    // 참가자 데이터 조회
    const participantsQuery = await db
      .prepare('SELECT gender, grade, created_at FROM participants WHERE booth_id = ?')
      .bind(boothId)
      .all()

    const participants = participantsQuery.results || []

    // 총 참가자 수
    const totalParticipants = participants.length

    // 성별 통계
    const genderStats = {
      male: participants.filter(p => p.gender === '남성').length,
      female: participants.filter(p => p.gender === '여성').length
    }

    // 교급 통계
    const gradeStats = {
      elementary: participants.filter(p => p.grade === '초등').length,
      middle: participants.filter(p => p.grade === '중등').length,
      high: participants.filter(p => p.grade === '고등').length,
      university: participants.filter(p => p.grade === '대학생').length,
      adult: participants.filter(p => p.grade === '성인').length
    }

    return c.json({
      booth_name: boothQuery.name,
      booth_code: boothQuery.booth_code,
      total_participants: totalParticipants,
      gender_stats: genderStats,
      grade_stats: gradeStats
    })
  } catch (error) {
    console.error('Public stats error:', error)
    return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
  }
})

export default publicStats
