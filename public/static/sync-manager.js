/**
 * Sync Manager - 오프라인/온라인 동기화 관리
 * 네트워크 상태를 감지하고 자동으로 데이터 동기화
 */

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine
    this.isSyncing = false
    this.syncInterval = null
    this.statusCallbacks = []
  }

  /**
   * 초기화
   */
  init() {
    console.log('[SyncManager] Initializing...')
    
    // 네트워크 상태 이벤트 리스너
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
    
    // 초기 상태 설정
    this.updateStatus()
    
    // 온라인이면 즉시 동기화 시도
    if (this.isOnline) {
      this.startPeriodicSync()
    }
    
    console.log('[SyncManager] Initialized. Online:', this.isOnline)
  }

  /**
   * 온라인 상태로 변경
   */
  handleOnline() {
    console.log('[SyncManager] Network status: ONLINE')
    this.isOnline = true
    this.updateStatus()
    this.showNotification('온라인 상태입니다. 데이터를 동기화합니다...', 'success')
    
    // 즉시 동기화 시도
    this.syncNow()
    
    // 주기적 동기화 시작 (30초마다)
    this.startPeriodicSync()
  }

  /**
   * 오프라인 상태로 변경
   */
  handleOffline() {
    console.log('[SyncManager] Network status: OFFLINE')
    this.isOnline = false
    this.updateStatus()
    this.showNotification('오프라인 상태입니다. 데이터는 로컬에 저장됩니다.', 'warning')
    
    // 주기적 동기화 중지
    this.stopPeriodicSync()
  }

  /**
   * 상태 업데이트 (UI 반영)
   */
  updateStatus() {
    // 상태 콜백 호출
    this.statusCallbacks.forEach(callback => {
      try {
        callback(this.isOnline)
      } catch (error) {
        console.error('[SyncManager] Status callback error:', error)
      }
    })
    
    // 상태 표시 업데이트
    this.updateStatusUI()
  }

  /**
   * 상태 UI 업데이트
   */
  updateStatusUI() {
    const statusBanner = document.getElementById('offline-status')
    
    if (!statusBanner) {
      // 상태 배너 생성
      this.createStatusBanner()
      return
    }
    
    if (!this.isOnline) {
      statusBanner.classList.remove('hidden')
    } else {
      statusBanner.classList.add('hidden')
    }
  }

  /**
   * 상태 배너 생성
   */
  createStatusBanner() {
    const banner = document.createElement('div')
    banner.id = 'offline-status'
    banner.className = 'fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-3 px-4 text-center shadow-lg transition-all duration-300'
    banner.style.transform = this.isOnline ? 'translateY(-100%)' : 'translateY(0)'
    
    if (this.isOnline) {
      banner.classList.add('hidden')
    }
    
    banner.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <i class="fas fa-wifi-slash"></i>
        <span class="font-semibold">오프라인 모드</span>
        <span class="text-sm">- 데이터는 로컬에 저장되며, 온라인 시 자동 전송됩니다</span>
      </div>
    `
    
    document.body.prepend(banner)
  }

  /**
   * 즉시 동기화
   */
  async syncNow() {
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress')
      return
    }
    
    if (!this.isOnline) {
      console.log('[SyncManager] Cannot sync while offline')
      return
    }
    
    this.isSyncing = true
    console.log('[SyncManager] Starting sync...')
    
    try {
      const pendingCount = await offlineDB.getPendingCount()
      
      if (pendingCount === 0) {
        console.log('[SyncManager] No pending data to sync')
        this.isSyncing = false
        return
      }
      
      console.log('[SyncManager] Syncing', pendingCount, 'pending items')
      
      const pendingData = await offlineDB.getPendingParticipants()
      let successCount = 0
      let failCount = 0
      
      for (const item of pendingData) {
        try {
          const response = await fetch('/api/participants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.participant)
          })
          
          if (response.ok) {
            const result = await response.json()
            
            // 동기화 성공 - pending에서 삭제하고 synced에 추가
            await offlineDB.deletePendingParticipant(item.id)
            await offlineDB.addSyncedParticipant(result.participant)
            
            successCount++
            console.log('[SyncManager] Synced item:', item.id)
          } else {
            failCount++
            console.error('[SyncManager] Failed to sync item:', item.id, response.status)
          }
        } catch (error) {
          failCount++
          console.error('[SyncManager] Sync error for item:', item.id, error)
        }
      }
      
      console.log('[SyncManager] Sync completed. Success:', successCount, 'Failed:', failCount)
      
      if (successCount > 0) {
        this.showNotification(`${successCount}개의 데이터가 동기화되었습니다.`, 'success')
      }
      
      if (failCount > 0) {
        this.showNotification(`${failCount}개의 데이터 동기화에 실패했습니다.`, 'error')
      }
      
    } catch (error) {
      console.error('[SyncManager] Sync error:', error)
      this.showNotification('동기화 중 오류가 발생했습니다.', 'error')
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 주기적 동기화 시작 (30초마다)
   */
  startPeriodicSync() {
    if (this.syncInterval) {
      return
    }
    
    this.syncInterval = setInterval(() => {
      this.syncNow()
    }, 30000) // 30초마다
    
    console.log('[SyncManager] Periodic sync started (every 30s)')
  }

  /**
   * 주기적 동기화 중지
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('[SyncManager] Periodic sync stopped')
    }
  }

  /**
   * 알림 표시
   */
  showNotification(message, type = 'info') {
    // Toast 알림 생성
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg text-white transition-all duration-300 transform translate-y-0 opacity-100`
    
    // 타입별 색상
    const colors = {
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }
    
    const icons = {
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      info: 'fa-info-circle'
    }
    
    toast.classList.add(colors[type] || colors.info)
    
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas ${icons[type] || icons.info} text-xl"></i>
        <span class="font-medium">${message}</span>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // 3초 후 제거
    setTimeout(() => {
      toast.style.transform = 'translateY(100%)'
      toast.style.opacity = '0'
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  /**
   * 상태 변경 콜백 등록
   */
  onStatusChange(callback) {
    this.statusCallbacks.push(callback)
  }

  /**
   * 현재 온라인 상태 반환
   */
  isNetworkOnline() {
    return this.isOnline
  }
}

// 전역 인스턴스
const syncManager = new SyncManager()

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    syncManager.init()
  })
} else {
  syncManager.init()
}
