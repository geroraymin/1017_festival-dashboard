/**
 * API 클라이언트 유틸리티
 */

// API 기본 URL (프로덕션에서는 자동으로 현재 도메인 사용)
const API_BASE_URL = window.location.origin + '/api'

// 로컬 스토리지 키
const TOKEN_KEY = 'guestbook_token'
const USER_KEY = 'guestbook_user'

/**
 * 토큰 저장
 */
function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 토큰 조회
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 토큰 삭제
 */
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * 사용자 정보 저장
 */
function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 사용자 정보 조회
 */
function getUser() {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

/**
 * HTTP 요청 함수
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.')
    }
    
    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

/**
 * 인증 API
 */
const AuthAPI = {
  // 관리자 로그인
  adminLogin: (username, password) => {
    return request('/auth/admin', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  },
  
  // 운영자 로그인
  operatorLogin: (booth_code) => {
    return request('/auth/operator', {
      method: 'POST',
      body: JSON.stringify({ booth_code })
    })
  },
  
  // 토큰 검증
  verify: () => {
    return request('/auth/verify', { method: 'POST' })
  }
}

/**
 * 행사 API
 */
const EventsAPI = {
  // 모든 행사 조회
  getAll: () => request('/events'),
  
  // 행사 상세 조회
  getOne: (id) => request(`/events/${id}`),
  
  // 행사 생성
  create: (data) => request('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 행사 수정
  update: (id, data) => request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 행사 삭제
  delete: (id) => request(`/events/${id}`, {
    method: 'DELETE'
  }),
  
  // 행사 활성화/비활성화
  toggle: (id) => request(`/events/${id}/toggle`, {
    method: 'PATCH'
  })
}

/**
 * 부스 API
 */
const BoothsAPI = {
  // 부스 목록 조회
  getAll: (eventId) => {
    const query = eventId ? `?event_id=${eventId}` : ''
    return request(`/booths${query}`)
  },
  
  // 부스 상세 조회
  getOne: (id) => request(`/booths/${id}`),
  
  // 부스 생성
  create: (data) => request('/booths', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 부스 수정
  update: (id, data) => request(`/booths/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // 부스 삭제
  delete: (id) => request(`/booths/${id}`, {
    method: 'DELETE'
  }),
  
  // 부스 코드 재발급
  regenerateCode: (id) => request(`/booths/${id}/regenerate-code`, {
    method: 'POST'
  }),
  
  // 부스 활성화/비활성화
  toggle: (id) => request(`/booths/${id}/toggle`, {
    method: 'PATCH'
  })
}

/**
 * 참가자 API
 */
const ParticipantsAPI = {
  // 참가자 목록 조회
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/participants${query ? '?' + query : ''}`)
  },
  
  // 참가자 등록
  create: (data) => request('/participants', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // 참가자 삭제
  delete: (id) => request(`/participants/${id}`, {
    method: 'DELETE'
  })
}

/**
 * 통계 API
 */
const StatsAPI = {
  // 부스별 통계
  getBooth: (boothId) => request(`/stats/booth/${boothId}`),
  
  // 행사별 통계
  getEvent: (eventId) => request(`/stats/event/${eventId}`),
  
  // 전체 통계
  getAll: () => request('/stats/all')
}

/**
 * 로그아웃
 */
function logout() {
  clearToken()
  window.location.href = '/'
}

/**
 * 인증 확인
 */
function checkAuth() {
  const token = getToken()
  const user = getUser()
  
  if (!token || !user) {
    logout()
    return false
  }
  
  return true
}

/**
 * 이메일 API
 */
const EmailAPI = {
  // CSV를 이메일로 전송
  sendCSV: (recipient_email) => {
    return request('/email/send-csv', {
      method: 'POST',
      body: JSON.stringify({ recipient_email })
    })
  }
}
