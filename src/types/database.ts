// 데이터베이스 테이블 타입 정의

export interface Admin {
  id: string
  username: string
  password_hash: string
  created_at: string
}

export interface Event {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booth {
  id: string
  event_id: string
  name: string
  booth_code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  booth_id: string | null
  name: string
  gender: '남성' | '여성' | '기타'
  grade: '초등' | '중등' | '고등' | '기타'
  date_of_birth: string
  has_consented: boolean
  created_at: string
}

// API 요청/응답 타입

export interface LoginRequest {
  username: string
  password: string
}

export interface BoothLoginRequest {
  booth_code: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username?: string
    booth_id?: string
    booth_code?: string
    role: 'admin' | 'operator'
  }
}

export interface CreateEventRequest {
  name: string
  start_date: string
  end_date: string
}

export interface CreateBoothRequest {
  event_id: string
  name: string
  description?: string
}

export interface CreateParticipantRequest {
  booth_id: string
  name: string
  gender: '남성' | '여성' | '기타'
  grade: '초등' | '중등' | '고등' | '기타'
  date_of_birth: string
  has_consented: boolean
}

export interface BoothStats {
  booth_id: string
  booth_name: string
  total_participants: number
  gender_distribution: {
    male: number
    female: number
    other: number
  }
  grade_distribution: {
    elementary: number
    middle: number
    high: number
    other: number
  }
  hourly_distribution: Record<string, number>
}

export interface EventStats {
  event_id: string
  event_name: string
  total_participants: number
  booth_count: number
  booths: BoothStats[]
}
