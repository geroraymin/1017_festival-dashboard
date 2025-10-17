import { Hono } from 'hono'
import { createSupabaseClient, type Env } from '../lib/supabase'
import { authMiddleware, operatorOrAdmin } from '../middlewares/auth'
import type { BoothStats, EventStats } from '../types/database'

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

    const supabase = createSupabaseClient(c.env)

    // 부스 정보 조회
    const { data: booth, error: boothError } = await supabase
      .from('booths')
      .select('id, name, booth_code')
      .eq('id', boothId)
      .single()

    if (boothError || !booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    // 참가자 데이터 조회
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .eq('booth_id', boothId)

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
    }

    // 통계 계산
    const totalParticipants = participants?.length || 0
    
    const genderDistribution = {
      male: participants?.filter(p => p.gender === '남성').length || 0,
      female: participants?.filter(p => p.gender === '여성').length || 0,
      other: participants?.filter(p => p.gender === '기타').length || 0
    }

    const gradeDistribution = {
      elementary: participants?.filter(p => p.grade === '초등').length || 0,
      middle: participants?.filter(p => p.grade === '중등').length || 0,
      high: participants?.filter(p => p.grade === '고등').length || 0,
      other: participants?.filter(p => p.grade === '기타').length || 0
    }

    // 시간대별 분포 (시간별 참가자 수)
    const hourlyDistribution: Record<string, number> = {}
    participants?.forEach(p => {
      const hour = new Date(p.created_at).getHours()
      const hourKey = `${hour}:00`
      hourlyDistribution[hourKey] = (hourlyDistribution[hourKey] || 0) + 1
    })

    const boothStats: BoothStats = {
      booth_id: booth.id,
      booth_name: booth.name,
      total_participants: totalParticipants,
      gender_distribution: genderDistribution,
      grade_distribution: gradeDistribution,
      hourly_distribution: hourlyDistribution
    }

    return c.json({ stats: boothStats })
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
    const supabase = createSupabaseClient(c.env)

    // 행사 정보 조회
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return c.json({ error: '행사를 찾을 수 없습니다.' }, 404)
    }

    // 행사의 모든 부스 조회
    const { data: booths, error: boothsError } = await supabase
      .from('booths')
      .select('id, name')
      .eq('event_id', eventId)

    if (boothsError) {
      console.error('Error fetching booths:', boothsError)
      return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
    }

    // 각 부스별 통계 계산
    const boothStatsPromises = (booths || []).map(async (booth) => {
      const { data: participants } = await supabase
        .from('participants')
        .select('*')
        .eq('booth_id', booth.id)

      const totalParticipants = participants?.length || 0
      
      const genderDistribution = {
        male: participants?.filter(p => p.gender === '남성').length || 0,
        female: participants?.filter(p => p.gender === '여성').length || 0,
        other: participants?.filter(p => p.gender === '기타').length || 0
      }

      const gradeDistribution = {
        elementary: participants?.filter(p => p.grade === '초등').length || 0,
        middle: participants?.filter(p => p.grade === '중등').length || 0,
        high: participants?.filter(p => p.grade === '고등').length || 0,
        other: participants?.filter(p => p.grade === '기타').length || 0
      }

      const hourlyDistribution: Record<string, number> = {}
      participants?.forEach(p => {
        const hour = new Date(p.created_at).getHours()
        const hourKey = `${hour}:00`
        hourlyDistribution[hourKey] = (hourlyDistribution[hourKey] || 0) + 1
      })

      return {
        booth_id: booth.id,
        booth_name: booth.name,
        total_participants: totalParticipants,
        gender_distribution: genderDistribution,
        grade_distribution: gradeDistribution,
        hourly_distribution: hourlyDistribution
      } as BoothStats
    })

    const boothsStats = await Promise.all(boothStatsPromises)
    const totalParticipants = boothsStats.reduce((sum, b) => sum + b.total_participants, 0)

    const eventStats: EventStats = {
      event_id: event.id,
      event_name: event.name,
      total_participants: totalParticipants,
      booth_count: booths?.length || 0,
      booths: boothsStats
    }

    return c.json({ stats: eventStats })
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

    const supabase = createSupabaseClient(c.env)

    // 모든 행사 조회
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name')
      .eq('is_active', true)

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
    }

    // 각 행사별 통계 계산
    const eventStatsPromises = (events || []).map(async (event) => {
      const { data: booths } = await supabase
        .from('booths')
        .select('id, name')
        .eq('event_id', event.id)

      const boothStatsPromises = (booths || []).map(async (booth) => {
        const { data: participants } = await supabase
          .from('participants')
          .select('*')
          .eq('booth_id', booth.id)

        const totalParticipants = participants?.length || 0
        
        const genderDistribution = {
          male: participants?.filter(p => p.gender === '남성').length || 0,
          female: participants?.filter(p => p.gender === '여성').length || 0,
          other: participants?.filter(p => p.gender === '기타').length || 0
        }

        const gradeDistribution = {
          elementary: participants?.filter(p => p.grade === '초등').length || 0,
          middle: participants?.filter(p => p.grade === '중등').length || 0,
          high: participants?.filter(p => p.grade === '고등').length || 0,
          other: participants?.filter(p => p.grade === '기타').length || 0
        }

        const hourlyDistribution: Record<string, number> = {}
        participants?.forEach(p => {
          const hour = new Date(p.created_at).getHours()
          const hourKey = `${hour}:00`
          hourlyDistribution[hourKey] = (hourlyDistribution[hourKey] || 0) + 1
        })

        return {
          booth_id: booth.id,
          booth_name: booth.name,
          total_participants: totalParticipants,
          gender_distribution: genderDistribution,
          grade_distribution: gradeDistribution,
          hourly_distribution: hourlyDistribution
        } as BoothStats
      })

      const boothsStats = await Promise.all(boothStatsPromises)
      const totalParticipants = boothsStats.reduce((sum, b) => sum + b.total_participants, 0)

      return {
        event_id: event.id,
        event_name: event.name,
        total_participants: totalParticipants,
        booth_count: booths?.length || 0,
        booths: boothsStats
      } as EventStats
    })

    const allStats = await Promise.all(eventStatsPromises)
    const grandTotal = allStats.reduce((sum, e) => sum + e.total_participants, 0)

    return c.json({ 
      total_participants: grandTotal,
      events: allStats 
    })
  } catch (error) {
    console.error('All stats error:', error)
    return c.json({ error: '통계 데이터를 불러오는데 실패했습니다.' }, 500)
  }
})

export default stats
