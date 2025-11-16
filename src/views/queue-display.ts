/**
 * 대기 화면 페이지 (부스 입구 TV/모니터용) - Apple HIG
 * 현재 진행 번호와 대기 인원을 크게 표시
 */

export const queueDisplayPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대기 현황</title>
    <link rel="stylesheet" href="/static/style.css">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        .slide-up {
            animation: slideUp 0.5s ease-out;
        }
    </style>
</head>
<body style="background: linear-gradient(135deg, #1E3A8A 0%, #6B21A8 50%, #4338CA 100%); min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;">
    <!-- 헤더 -->
    <header style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); padding: 1.5rem;">
        <div style="max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="font-size: 2rem; font-weight: 800; color: white; margin: 0 0 0.25rem 0; letter-spacing: -1px;">
                    <i class="fas fa-users-line" style="margin-right: 0.75rem;"></i>
                    대기 현황
                </h1>
                <p style="color: rgba(255, 255, 255, 0.7); margin: 0; font-size: 1rem;" id="boothName">부스명 로딩 중...</p>
            </div>
            <div style="color: rgba(255, 255, 255, 0.7); font-size: 1.125rem; font-weight: 600;" id="currentTime">--:--</div>
        </div>
    </header>

    <!-- 메인 디스플레이 -->
    <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div style="max-width: 1200px; width: 100%;">
            <!-- 현재 번호 카드 -->
            <div class="slide-up" style="background: linear-gradient(135deg, #32D74B 0%, #30BE47 100%); border-radius: 32px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); padding: 3rem; margin-bottom: 2rem;">
                <div style="text-align: center;">
                    <div style="color: rgba(255, 255, 255, 0.95); font-size: 2rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.5px;">
                        <i class="fas fa-bell" style="margin-right: 0.75rem;"></i>
                        현재 진행 번호
                    </div>
                    <div style="background: white; border-radius: 24px; padding: 2rem; margin-bottom: 1rem;">
                        <div id="currentNumber" class="animate-pulse-slow" style="font-size: 8rem; font-weight: 900; color: #32D74B; line-height: 1; letter-spacing: -4px;">
                            -
                        </div>
                    </div>
                    <div style="color: white; font-size: 1.5rem; font-weight: 600;">
                        위 번호의 손님은 입장해주세요!
                    </div>
                </div>
            </div>

            <!-- 대기 정보 -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                <!-- 마지막 발급 번호 -->
                <div class="slide-up" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 24px; padding: 2rem;">
                    <div style="color: rgba(255, 255, 255, 0.8); font-size: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; font-weight: 600;">
                        <i class="fas fa-ticket" style="margin-right: 0.75rem;"></i>
                        마지막 발급 번호
                    </div>
                    <div id="lastNumber" style="font-size: 4rem; font-weight: 800; color: white; line-height: 1; letter-spacing: -2px;">
                        -
                    </div>
                </div>

                <!-- 대기 인원 -->
                <div class="slide-up" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 24px; padding: 2rem;">
                    <div style="color: rgba(255, 255, 255, 0.8); font-size: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; font-weight: 600;">
                        <i class="fas fa-users" style="margin-right: 0.75rem;"></i>
                        대기 인원
                    </div>
                    <div style="display: flex; align-items: baseline;">
                        <div id="waitingCount" style="font-size: 4rem; font-weight: 800; color: white; line-height: 1; letter-spacing: -2px;">
                            -
                        </div>
                        <div style="font-size: 2rem; color: rgba(255, 255, 255, 0.7); margin-left: 0.75rem; font-weight: 600;">명</div>
                    </div>
                </div>
            </div>

            <!-- 안내 메시지 -->
            <div style="margin-top: 2rem; text-align: center;">
                <div style="background: rgba(255, 214, 10, 0.2); backdrop-filter: blur(20px); border-radius: 16px; padding: 1.5rem; display: inline-block;">
                    <p style="color: #FFE066; font-size: 1.125rem; margin: 0; font-weight: 600;">
                        <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                        내 차례가 되면 번호가 표시됩니다
                    </p>
                </div>
            </div>
        </div>
    </main>

    <!-- 푸터 -->
    <footer style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); padding: 1rem;">
        <div style="max-width: 1280px; margin: 0 auto; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;">
            <i class="fas fa-sync-alt" style="margin-right: 0.5rem;"></i>
            10초마다 자동 새로고침
        </div>
    </footer>

    <script src="/static/js/api.js"></script>
    <script>
        // URL에서 booth_id 파라미터 가져오기
        const urlParams = new URLSearchParams(window.location.search)
        const boothId = urlParams.get('booth_id')

        if (!boothId) {
            alert('부스 ID가 필요합니다.')
            window.close()
        }

        // 현재 시각 업데이트
        function updateClock() {
            const now = new Date()
            const hours = String(now.getHours()).padStart(2, '0')
            const minutes = String(now.getMinutes()).padStart(2, '0')
            document.getElementById('currentTime').textContent = hours + ':' + minutes
        }

        // 대기 상황 업데이트
        async function updateQueueStatus() {
            try {
                const data = await QueueAPI.getStatus(boothId)
                
                // 숫자 애니메이션을 위해 클래스 제거 후 재추가
                const currentEl = document.getElementById('currentNumber')
                const lastEl = document.getElementById('lastNumber')
                const waitingEl = document.getElementById('waitingCount')
                
                currentEl.classList.remove('slide-up')
                void currentEl.offsetWidth // 리플로우 강제
                currentEl.classList.add('slide-up')
                
                currentEl.textContent = data.current_number || '-'
                lastEl.textContent = data.last_number || '-'
                waitingEl.textContent = data.waiting_count || '0'
                
                console.log('[대기 화면] 업데이트:', data)
            } catch (error) {
                console.error('[대기 화면] 업데이트 실패:', error)
            }
        }

        // 부스 정보 로드
        async function loadBoothInfo() {
            try {
                const response = await BoothsAPI.getOne(boothId)
                document.getElementById('boothName').textContent = response.booth.name
            } catch (error) {
                console.error('[대기 화면] 부스 정보 로드 실패:', error)
            }
        }

        // 초기 로드
        updateClock()
        loadBoothInfo()
        updateQueueStatus()

        // 1초마다 시계 업데이트
        setInterval(updateClock, 1000)

        // 10초마다 대기 상황 업데이트
        setInterval(updateQueueStatus, 10000)
    </script>
</body>
</html>
`
