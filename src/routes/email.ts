import { Hono } from 'hono'
import sgMail from '@sendgrid/mail'
import { type Env } from '../lib/d1'
import { authMiddleware, operatorOrAdmin } from '../middlewares/auth'

const email = new Hono<{ Bindings: Env }>()

/**
 * POST /api/email/send-csv
 * 부스 참가자 CSV를 이메일로 전송 (SendGrid)
 */
email.post('/send-csv', authMiddleware, operatorOrAdmin, async (c) => {
  try {
    const body = await c.req.json()
    const { recipient_email } = body
    const user = c.get('user')

    // 이메일 주소 검증
    if (!recipient_email || !recipient_email.includes('@')) {
      return c.json({ error: '유효한 이메일 주소를 입력해주세요.' }, 400)
    }

    // SendGrid API 키 확인
    const sendgridApiKey = c.env.SENDGRID_API_KEY
    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY not found in environment')
      return c.json({ error: '이메일 서비스가 설정되지 않았습니다.' }, 500)
    }

    // SendGrid 초기화
    sgMail.setApiKey(sendgridApiKey)
    
    const db = c.env.DB

    // 운영자는 자신의 부스 참가자만 조회 가능
    let boothId: number
    let boothName: string = '부스'

    if (user.role === 'operator') {
      boothId = user.booth_id
      
      // 부스 정보 가져오기
      const boothResult = await db
        .prepare('SELECT name FROM booths WHERE id = ?')
        .bind(boothId)
        .first()
      
      if (boothResult) {
        boothName = boothResult.name as string
      }
    } else {
      return c.json({ error: '운영자만 이메일 전송이 가능합니다.' }, 403)
    }

    // 참가자 데이터 가져오기
    const participantsResult = await db
      .prepare(`
        SELECT p.*,
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
            ) THEN '같은 부스 재방문'
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
            ) THEN '행사 내 타부스 방문'
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
            ) THEN '다른 행사 방문자'
            ELSE '첫방문'
          END as visit_label
        FROM participants p 
        LEFT JOIN booths b ON p.booth_id = b.id
        WHERE p.booth_id = ? 
        ORDER BY p.created_at DESC
      `)
      .bind(boothId)
      .all()

    const participants = participantsResult.results || []

    if (participants.length === 0) {
      return c.json({ error: '전송할 참가자 데이터가 없습니다.' }, 400)
    }

    // CSV 생성
    let csv = '\uFEFF이름,성별,교급,생년월일,등록일시,방문형태,참석확인\n'
    
    participants.forEach((p: any) => {
      const createdAt = new Date(p.created_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const attended = Number(p.attended || 0) === 1 ? '참석' : '미확인'
      csv += `${p.name},${p.gender},${p.grade},${p.date_of_birth},${createdAt},${p.visit_label || '첫방문'},${attended}\n`
    })

    // CSV를 Base64로 인코딩
    const csvBase64 = Buffer.from(csv, 'utf-8').toString('base64')

    // 현재 날짜
    const today = new Date().toISOString().split('T')[0]
    const filename = `booth_${boothName}_${today}.csv`

    // SendGrid로 이메일 전송
    const msg = {
      to: recipient_email,
      from: c.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com', // 인증된 발신자 이메일
      subject: `[${boothName}] 참가자 명단`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #14b8a6;">📋 참가자 명단</h2>
          <p>안녕하세요,</p>
          <p><strong>${boothName}</strong> 부스의 참가자 명단(CSV)을 첨부했습니다.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>부스명:</strong> ${boothName}</p>
            <p style="margin: 4px 0;"><strong>참가자 수:</strong> ${participants.length}명</p>
            <p style="margin: 4px 0;"><strong>생성일:</strong> ${today}</p>
          </div>
          
          <p>첨부된 CSV 파일을 Excel이나 Google Sheets에서 열어보실 수 있습니다.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            감사합니다.<br>
            축제 디지털방명록 시스템
          </p>
        </div>
      `,
      attachments: [
        {
          content: csvBase64,
          filename: filename,
          type: 'text/csv',
          disposition: 'attachment'
        }
      ]
    }

    const response = await sgMail.send(msg)

    return c.json({
      success: true,
      message: `${recipient_email}로 ${participants.length}명의 참가자 명단을 전송했습니다.`,
      email_id: response[0].headers['x-message-id']
    })

  } catch (error: any) {
    console.error('이메일 전송 실패:', error)
    
    // SendGrid 에러 상세 정보
    let errorDetails = error.message
    if (error.response) {
      console.error('SendGrid Error Response:', error.response)
      console.error('SendGrid Error Body:', error.response.body)
      errorDetails = JSON.stringify(error.response.body || error.response)
    }
    
    return c.json({ 
      error: '이메일 전송 중 오류가 발생했습니다.',
      details: errorDetails,
      sendgrid_error: error.response?.body || null
    }, 500)
  }
})

export default email
