import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'
import { createSupabaseClient, type Env } from '../lib/supabase'
import { authMiddleware, adminOnly } from '../middlewares/auth'
import type { CreateBoothRequest, Booth } from '../types/database'

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
    const supabase = createSupabaseClient(c.env)

    // 부스 정보와 통계 조회
    const { data: booth, error: boothError } = await supabase
      .from('booths')
      .select('*, events(*)')
      .eq('id', boothId)
      .single()

    if (boothError || !booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    // 총 참가자 수
    const { count: totalParticipants, error: countError } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('booth_id', boothId)

    if (countError) {
      console.error('Error counting participants:', countError)
    }

    // 성별 분포
    const { data: genderData, error: genderError } = await supabase
      .from('participants')
      .select('gender')
      .eq('booth_id', boothId)

    const genderDistribution: Record<string, number> = {}
    if (!genderError && genderData) {
      genderData.forEach(p => {
        genderDistribution[p.gender] = (genderDistribution[p.gender] || 0) + 1
      })
    }

    // 교급 분포 (모든 교급을 0으로 초기화)
    const allGrades = ['유아', '초등', '중등', '고등', '성인']
    const gradeDistribution: Record<string, number> = {}
    allGrades.forEach(grade => {
      gradeDistribution[grade] = 0
    })
    
    const { data: gradeData, error: gradeError } = await supabase
      .from('participants')
      .select('grade')
      .eq('booth_id', boothId)

    if (!gradeError && gradeData) {
      gradeData.forEach(p => {
        if (allGrades.includes(p.grade)) {
          gradeDistribution[p.grade] = (gradeDistribution[p.grade] || 0) + 1
        }
      })
    }

    return c.json({
      booth: {
        name: booth.name,
        event_name: booth.events?.name || '행사'
      },
      stats: {
        total_participants: totalParticipants || 0,
        gender_distribution: genderDistribution,
        grade_distribution: gradeDistribution
      }
    })
  } catch (error) {
    console.error('Public stats fetch error:', error)
    return c.json({ error: '통계를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/booths/find-code
 * 부스 코드 찾기 (인증 불필요 - 운영자 셀프서비스용)
 * Request body: { event_id: string, booth_name: string }
 * Response: { booths: Array<{ id, name, booth_code, event_name }> }
 */
booths.post('/find-code', async (c) => {
  try {
    const body = await c.req.json<{ event_id?: string, booth_name?: string }>()
    const { event_id, booth_name } = body

    if (!event_id || !booth_name) {
      return c.json({ error: '행사와 부스 이름을 입력해주세요.' }, 400)
    }

    const trimmedBoothName = booth_name.trim()
    if (trimmedBoothName.length === 0) {
      return c.json({ error: '부스 이름을 입력해주세요.' }, 400)
    }

    const supabase = createSupabaseClient(c.env)

    // 부스 검색 (활성 부스만, 부분 문자열 매칭, 대소문자 무관)
    const { data: booths, error } = await supabase
      .from('booths')
      .select('id, name, booth_code, event_id, events(name)')
      .eq('event_id', event_id)
      .eq('is_active', true)
      .ilike('name', `%${trimmedBoothName}%`)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error finding booths:', error)
      return c.json({ error: '부스 검색에 실패했습니다.' }, 500)
    }

    // 결과 포맷팅
    const formattedBooths = (booths || []).map(booth => ({
      id: booth.id,
      name: booth.name,
      booth_code: booth.booth_code,
      event_name: booth.events?.name || '알 수 없는 행사'
    }))

    return c.json({ 
      booths: formattedBooths,
      count: formattedBooths.length
    })
  } catch (error) {
    console.error('Booth code finder error:', error)
    return c.json({ error: '부스 코드 찾기에 실패했습니다.' }, 500)
  }
})

// 모든 라우트에 인증 미들웨어 적용
booths.use('/*', authMiddleware)

/**
 * GET /api/booths
 * 부스 목록 조회 (쿼리 파라미터로 event_id 필터 가능)
 */
booths.get('/', async (c) => {
  try {
    const eventId = c.req.query('event_id')
    const supabase = createSupabaseClient(c.env)

    let query = supabase
      .from('booths')
      .select('*, events(*)')
      .order('created_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching booths:', error)
      return c.json({ error: '부스 목록을 불러오는데 실패했습니다.' }, 500)
    }

    return c.json({ booths: data || [] })
  } catch (error) {
    console.error('Booths fetch error:', error)
    return c.json({ error: '부스 목록을 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * GET /api/booths/:id
 * 특정 부스 상세 조회
 */
booths.get('/:id', async (c) => {
  try {
    const boothId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    const { data: booth, error } = await supabase
      .from('booths')
      .select('*, events(*)')
      .eq('id', boothId)
      .single()

    if (error || !booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    return c.json({ booth })
  } catch (error) {
    console.error('Booth fetch error:', error)
    return c.json({ error: '부스 정보를 불러오는데 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/booths
 * 새 부스 생성 (관리자 전용)
 */
booths.post('/', adminOnly, async (c) => {
  try {
    const body = await c.req.json<CreateBoothRequest>()
    const { event_id, name, description } = body

    if (!event_id || !name) {
      return c.json({ error: '행사와 부스명을 입력해주세요.' }, 400)
    }

    const supabase = createSupabaseClient(c.env)

    // 행사 존재 확인
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return c.json({ error: '존재하지 않는 행사입니다.' }, 404)
    }

    // 고유한 부스 코드 생성 (중복 방지)
    let boothCode = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      boothCode = generateBoothCode()
      const { data: existingBooth } = await supabase
        .from('booths')
        .select('booth_code')
        .eq('booth_code', boothCode)
        .single()

      if (!existingBooth) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return c.json({ error: '부스 코드 생성에 실패했습니다. 다시 시도해주세요.' }, 500)
    }

    // 부스 생성
    const { data, error } = await supabase
      .from('booths')
      .insert([{
        event_id,
        name,
        description: description || null,
        booth_code: boothCode
      }])
      .select('*, events(*)')
      .single()

    if (error) {
      console.error('Error creating booth:', error)
      return c.json({ error: '부스 생성에 실패했습니다.' }, 500)
    }

    return c.json({ booth: data }, 201)
  } catch (error) {
    console.error('Booth creation error:', error)
    return c.json({ error: '부스 생성에 실패했습니다.' }, 500)
  }
})

/**
 * PUT /api/booths/:id
 * 부스 정보 수정 (관리자 전용)
 */
booths.put('/:id', adminOnly, async (c) => {
  try {
    const boothId = c.req.param('id')
    const body = await c.req.json<Partial<CreateBoothRequest>>()
    const { name, description } = body

    if (!name && description === undefined) {
      return c.json({ error: '수정할 내용을 입력해주세요.' }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    
    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const { data, error } = await supabase
      .from('booths')
      .update(updateData)
      .eq('id', boothId)
      .select('*, events(*)')
      .single()

    if (error || !data) {
      console.error('Error updating booth:', error)
      return c.json({ error: '부스 수정에 실패했습니다.' }, 500)
    }

    return c.json({ booth: data })
  } catch (error) {
    console.error('Booth update error:', error)
    return c.json({ error: '부스 수정에 실패했습니다.' }, 500)
  }
})

/**
 * DELETE /api/booths/:id
 * 부스 삭제 (관리자 전용)
 */
booths.delete('/:id', adminOnly, async (c) => {
  try {
    const boothId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    const { error } = await supabase
      .from('booths')
      .delete()
      .eq('id', boothId)

    if (error) {
      console.error('Error deleting booth:', error)
      return c.json({ error: '부스 삭제에 실패했습니다.' }, 500)
    }

    return c.json({ message: '부스가 삭제되었습니다.' })
  } catch (error) {
    console.error('Booth deletion error:', error)
    return c.json({ error: '부스 삭제에 실패했습니다.' }, 500)
  }
})

/**
 * POST /api/booths/:id/regenerate-code
 * 부스 코드 재발급 (관리자 전용)
 */
booths.post('/:id/regenerate-code', adminOnly, async (c) => {
  try {
    const boothId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    // 고유한 부스 코드 생성
    let boothCode = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      boothCode = generateBoothCode()
      const { data: existingBooth } = await supabase
        .from('booths')
        .select('booth_code')
        .eq('booth_code', boothCode)
        .single()

      if (!existingBooth) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return c.json({ error: '부스 코드 생성에 실패했습니다. 다시 시도해주세요.' }, 500)
    }

    // 부스 코드 업데이트
    const { data, error } = await supabase
      .from('booths')
      .update({ booth_code: boothCode })
      .eq('id', boothId)
      .select('*, events(*)')
      .single()

    if (error || !data) {
      console.error('Error regenerating booth code:', error)
      return c.json({ error: '부스 코드 재발급에 실패했습니다.' }, 500)
    }

    return c.json({ booth: data })
  } catch (error) {
    console.error('Booth code regeneration error:', error)
    return c.json({ error: '부스 코드 재발급에 실패했습니다.' }, 500)
  }
})

/**
 * PATCH /api/booths/:id/toggle
 * 부스 활성화/비활성화 토글 (관리자 전용)
 */
booths.patch('/:id/toggle', adminOnly, async (c) => {
  try {
    const boothId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    // 현재 상태 조회
    const { data: booth, error: fetchError } = await supabase
      .from('booths')
      .select('is_active')
      .eq('id', boothId)
      .single()

    if (fetchError || !booth) {
      return c.json({ error: '부스를 찾을 수 없습니다.' }, 404)
    }

    // 상태 반전
    const { data, error } = await supabase
      .from('booths')
      .update({ is_active: !booth.is_active })
      .eq('id', boothId)
      .select('*, events(*)')
      .single()

    if (error) {
      console.error('Error toggling booth:', error)
      return c.json({ error: '부스 상태 변경에 실패했습니다.' }, 500)
    }

    return c.json({ booth: data })
  } catch (error) {
    console.error('Booth toggle error:', error)
    return c.json({ error: '부스 상태 변경에 실패했습니다.' }, 500)
  }
})

export default booths
