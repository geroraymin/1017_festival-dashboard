// Service Worker for Offline Mode
const CACHE_NAME = 'guestbook-v1'
const OFFLINE_URL = '/offline.html'

// 캐시할 핵심 리소스
const ESSENTIAL_RESOURCES = [
  '/',
  '/operator',
  '/guestbook',
  OFFLINE_URL
]

// 설치 이벤트 - 핵심 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential resources')
        return cache.addAll(ESSENTIAL_RESOURCES)
      })
      .then(() => self.skipWaiting())
  )
})

// 활성화 이벤트 - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch 이벤트 - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 요청은 항상 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // API 요청 실패 시 오프라인 메시지 반환
          return new Response(
            JSON.stringify({ 
              error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.',
              offline: true 
            }),
            { 
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          )
        })
    )
    return
  }

  // HTML 페이지는 Network First, fallback to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 응답을 캐시에 저장
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // 캐시도 없으면 오프라인 페이지 반환
              return caches.match(OFFLINE_URL)
            })
        })
    )
    return
  }

  // 정적 리소스는 Cache First, fallback to Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        return fetch(request)
          .then((response) => {
            // 성공적인 응답만 캐시 (200-299)
            if (response && response.status === 200) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
      })
  )
})

// Background Sync 이벤트 - 오프라인 데이터 동기화
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-participants') {
    event.waitUntil(syncOfflineParticipants())
  }
})

// 오프라인 참가자 데이터 동기화 함수
async function syncOfflineParticipants() {
  try {
    // IndexedDB에서 동기화 대기 중인 참가자 데이터 가져오기
    const db = await openDB()
    const tx = db.transaction('pending', 'readonly')
    const store = tx.objectStore('pending')
    const pendingData = await store.getAll()
    
    console.log('[SW] Syncing', pendingData.length, 'pending participants')
    
    // 각 데이터를 서버로 전송
    for (const data of pendingData) {
      try {
        const response = await fetch('/api/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data.participant)
        })
        
        if (response.ok) {
          // 성공하면 IndexedDB에서 삭제
          const deleteTx = db.transaction('pending', 'readwrite')
          const deleteStore = deleteTx.objectStore('pending')
          await deleteStore.delete(data.id)
          console.log('[SW] Synced participant:', data.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync participant:', error)
      }
    }
    
    db.close()
  } catch (error) {
    console.error('[SW] Sync error:', error)
    throw error
  }
}

// IndexedDB 열기
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GuestbookDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // pending store: 동기화 대기 중인 데이터
      if (!db.objectStoreNames.contains('pending')) {
        const pendingStore = db.createObjectStore('pending', { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// 클라이언트로 메시지 전송
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
