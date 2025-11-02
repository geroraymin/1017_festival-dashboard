/**
 * IndexedDB 래퍼 - 오프라인 데이터 관리
 * 참가자 데이터를 로컬에 저장하고 온라인 시 동기화
 */

class OfflineDB {
  constructor() {
    this.dbName = 'GuestbookDB'
    this.version = 1
    this.db = null
  }

  /**
   * 데이터베이스 초기화
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('[OfflineDB] Failed to open database:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('[OfflineDB] Database opened successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        console.log('[OfflineDB] Upgrading database...')

        // pending store: 동기화 대기 중인 참가자 데이터
        if (!db.objectStoreNames.contains('pending')) {
          const pendingStore = db.createObjectStore('pending', {
            keyPath: 'id',
            autoIncrement: true
          })
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false })
          pendingStore.createIndex('booth_id', 'participant.booth_id', { unique: false })
          console.log('[OfflineDB] Created pending store')
        }

        // synced store: 동기화 완료된 데이터 (로컬 캐시)
        if (!db.objectStoreNames.contains('synced')) {
          const syncedStore = db.createObjectStore('synced', {
            keyPath: 'id'
          })
          syncedStore.createIndex('created_at', 'created_at', { unique: false })
          syncedStore.createIndex('booth_id', 'booth_id', { unique: false })
          console.log('[OfflineDB] Created synced store')
        }
      }
    })
  }

  /**
   * 참가자 데이터를 pending 상태로 저장
   */
  async addPendingParticipant(participantData) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['pending'], 'readwrite')
      const store = tx.objectStore('pending')

      const data = {
        participant: participantData,
        timestamp: Date.now(),
        status: 'pending'
      }

      const request = store.add(data)

      request.onsuccess = () => {
        console.log('[OfflineDB] Added pending participant:', request.result)
        resolve(request.result)
      }

      request.onerror = () => {
        console.error('[OfflineDB] Failed to add pending participant:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 모든 pending 참가자 가져오기
   */
  async getPendingParticipants() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['pending'], 'readonly')
      const store = tx.objectStore('pending')
      const request = store.getAll()

      request.onsuccess = () => {
        console.log('[OfflineDB] Retrieved pending participants:', request.result.length)
        resolve(request.result)
      }

      request.onerror = () => {
        console.error('[OfflineDB] Failed to get pending participants:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Pending 참가자 삭제
   */
  async deletePendingParticipant(id) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['pending'], 'readwrite')
      const store = tx.objectStore('pending')
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log('[OfflineDB] Deleted pending participant:', id)
        resolve()
      }

      request.onerror = () => {
        console.error('[OfflineDB] Failed to delete pending participant:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Pending 참가자 개수 가져오기
   */
  async getPendingCount() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['pending'], 'readonly')
      const store = tx.objectStore('pending')
      const request = store.count()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /**
   * 동기화 완료된 참가자를 synced store에 저장
   */
  async addSyncedParticipant(participantData) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['synced'], 'readwrite')
      const store = tx.objectStore('synced')
      const request = store.put(participantData)

      request.onsuccess = () => {
        console.log('[OfflineDB] Added synced participant:', participantData.id)
        resolve()
      }

      request.onerror = () => {
        console.error('[OfflineDB] Failed to add synced participant:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 모든 데이터 삭제 (테스트용)
   */
  async clearAll() {
    if (!this.db) await this.init()

    return Promise.all([
      this.clearStore('pending'),
      this.clearStore('synced')
    ])
  }

  /**
   * 특정 store의 모든 데이터 삭제
   */
  async clearStore(storeName) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        console.log('[OfflineDB] Cleared store:', storeName)
        resolve()
      }

      request.onerror = () => {
        console.error('[OfflineDB] Failed to clear store:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * 데이터베이스 닫기
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('[OfflineDB] Database closed')
    }
  }
}

// 전역 인스턴스
const offlineDB = new OfflineDB()

// 초기화
offlineDB.init().catch(error => {
  console.error('[OfflineDB] Initialization error:', error)
})
