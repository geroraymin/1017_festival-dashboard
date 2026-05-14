/**
 * 운영자 대시보드 - 대기열 관리 JavaScript
 */

let currentBoothId = null

function resolveCurrentBoothId() {
  if (currentBoothId) return currentBoothId

  if (typeof getUser === 'function') {
    const user = getUser()
    if (user?.booth_id) {
      currentBoothId = user.booth_id
      console.log('[대기열] 세션에서 부스 ID 복구:', currentBoothId)
    }
  }

  return currentBoothId
}

// 대기열 상태 새로고침
async function refreshQueue() {
  const boothId = resolveCurrentBoothId()
  if (!boothId) return
  
  try {
    const data = await QueueAPI.getStatus(boothId)
    
    document.getElementById('currentQueueNumber').textContent = data.current_number || '-'
    document.getElementById('lastQueueNumber').textContent = data.last_number || '-'
    document.getElementById('waitingCount').textContent = data.waiting_count || '0'
    
    console.log('[대기열] 상태 업데이트:', data)
  } catch (error) {
    console.error('[대기열] 상태 조회 실패:', error)
  }
}

// 다음 손님 호출
async function callNextGuest() {
  const boothId = resolveCurrentBoothId()
  if (!boothId) {
    alert('부스 정보를 불러오는 중입니다.')
    return
  }
  
  if (!confirm('다음 손님을 호출하시겠습니까?')) {
    return
  }
  
  try {
    const data = await QueueAPI.callNext(boothId)
    
    if (data.has_next) {
      alert(`${data.queue_number}번 손님 (${data.participant_name || '이름 없음'})을 호출했습니다!`)
      
      // 대기열 상태 새로고침
      await refreshQueue()
      
      // TODO: 푸시 알림 전송 (Phase 2/3에서 구현)
    } else {
      alert(data.message || '대기 중인 손님이 없습니다.')
    }
  } catch (error) {
    console.error('[대기열] 호출 실패:', error)
    alert('손님 호출에 실패했습니다: ' + error.message)
  }
}

// 대기 화면 열기 (새 창)
function openQueueDisplay() {
  const boothId = resolveCurrentBoothId()
  if (!boothId) {
    alert('부스 정보를 불러오는 중입니다.')
    return
  }
  
  const url = `/queue-display?booth_id=${encodeURIComponent(boothId)}`
  window.open(url, 'QueueDisplay', 'width=1920,height=1080,fullscreen=yes')
}

// 부스 ID 설정 (운영자 로그인 후 호출됨)
function setBoothIdForQueue(boothId) {
  currentBoothId = boothId
  console.log('[대기열] 부스 ID 설정:', boothId)
  
  // 대기열 상태 초기 로드
  refreshQueue()
  
  // 10초마다 자동 새로고침
  setInterval(refreshQueue, 10000)
}

// 전역 함수로 노출
window.refreshQueue = refreshQueue
window.callNextGuest = callNextGuest
window.openQueueDisplay = openQueueDisplay
window.setBoothIdForQueue = setBoothIdForQueue
