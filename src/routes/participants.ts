import { Hono } from 'hono'
import { createSupabaseClient, type Env } from '../lib/supabase'
import { authMiddleware, operatorOrAdmin } from '../middlewares/auth'
import type { CreateParticipantRequest, Participant } from '../types/database'

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

    const supabase = createSupabaseClient(c.env)

    // 부스 존재 및 활성화 상태 확인
    const { data: booth, error: boothError } = await supabase
      .from('booths')
      .select('id, is_active')
      .eq('id', booth_id)
      .single()

    if (boothError || !booth) {
      return c.json({ error: '존재하지 않는 부스입니다.' }, 404)
    }

    if (!booth.is_active) {
      return c.json({ error: '현재 비활성화된 부스입니다.' }, 400)
    }

    // 중복 등록 체크 (이름 + 생년월일 + 부스 조합)
    const { data: existingParticipant, error: checkError } = await supabase
      .from('participants')
      .select('id, name, created_at')
      .eq('booth_id', booth_id)
      .eq('name', name)
      .eq('date_of_birth', date_of_birth)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking duplicate:', checkError)
    }

    if (existingParticipant) {
      // 중복 등록 감지 - 이미 등록된 사용자
      const createdAt = new Date(existingParticipant.created_at)
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
        error: `이미 등록된 참가자입니다.\n${existingParticipant.name}님은 ${timeMessage}에 등록하셨습니다.`,
        duplicate: true,
        existing_participant: {
          name: existingParticipant.name,
          created_at: existingParticipant.created_at
        }
      }, 409)
    }

    // 참가자 등록
    const { data, error } = await supabase
      .from('participants')
      .insert([{
        booth_id,
        name,
        gender,
        grade,
        date_of_birth,
        has_consented
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating participant:', error)
      return c.json({ error: '참가자 등록에 실패했습니다.' }, 500)
    }

    return c.json({ 
      message: '방명록 작성이 완료되었습니다. 감사합니다!',
      participant: data 
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

    const supabase = createSupabaseClient(c.env)
    const user = c.get('user')

    // 운영자는 자신의 부스 참가자만 조회 가능
    if (user.role === 'operator' && user.booth_id) {
      const { data, error, count } = await supabase
        .from('participants')
        .select('*, booths(name, booth_code)', { count: 'exact' })
        .eq('booth_id', user.booth_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching participants:', error)
        return c.json({ error: '참가자 목록을 불러오는데 실패했습니다.' }, 500)
      }

      return c.json({ participants: data || [], total: count || 0 })
    }

    // 관리자는 모든 참가자 조회 가능
    let query = supabase
      .from('participants')
      .select('*, booths(name, booth_code, event_id)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (boothId) {
      query = query.eq('booth_id', boothId)
    }

    if (eventId) {
      query = query.eq('booths.event_id', eventId)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching participants:', error)
      return c.json({ error: '참가자 목록을 불러오는데 실패했습니다.' }, 500)
    }

    return c.json({ participants: data || [], total: count || 0 })
  } catch (error) {
    console.error('Participants fetch error:', error)
    return c.json({ error: '참가자 목록을 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/participants/:id
 * 참가자 삭제 (관리자 전용)
 */
participants.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    
    if (user.role !== 'admin') {
      return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
    }

    const participantId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)

    if (error) {
      console.error('Error deleting participant:', error)
      return c.json({ error: '참가자 삭제에 실패했습니다.' }, 500)
    }

    return c.json({ message: '참가자가 삭제되었습니다.' })
  } catch (error) {
    console.error('Participant deletion error:', error)
    return c.json({ error: '참가자 삭제에 실패했습니다.' }, 500)
  }
})

export default participants
