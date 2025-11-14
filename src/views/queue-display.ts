/**
 * 대기 화면 페이지 (부스 입구 TV/모니터용)
 * 현재 진행 번호와 대기 인원을 크게 표시
 */

export const queueDisplayPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대기 현황</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
<body class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen flex flex-col overflow-hidden">
    <!-- 헤더 -->
    <header class="bg-white/10 backdrop-blur-lg p-6">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-white mb-1">
                    <i class="fas fa-users-line mr-3"></i>
                    대기 현황
                </h1>
                <p class="text-white/70" id="boothName">부스명 로딩 중...</p>
            </div>
            <div class="text-white/70 text-lg" id="currentTime">--:--</div>
        </div>
    </header>

    <!-- 메인 디스플레이 -->
    <main class="flex-1 flex items-center justify-center p-8">
        <div class="max-w-6xl w-full">
            <!-- 현재 번호 카드 -->
            <div class="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-2xl p-12 mb-8 slide-up">
                <div class="text-center">
                    <div class="text-white/90 text-3xl font-semibold mb-4">
                        <i class="fas fa-bell mr-3"></i>
                        현재 진행 번호
                    </div>
                    <div class="bg-white rounded-2xl p-8 mb-4">
                        <div id="currentNumber" class="text-9xl font-black text-emerald-600 animate-pulse-slow">
                            -
                        </div>
                    </div>
                    <div class="text-white text-2xl">
                        위 번호의 손님은 입장해주세요!
                    </div>
                </div>
            </div>

            <!-- 대기 정보 -->
            <div class="grid grid-cols-2 gap-6">
                <!-- 마지막 발급 번호 -->
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 slide-up">
                    <div class="text-white/80 text-xl mb-4 flex items-center">
                        <i class="fas fa-ticket mr-3"></i>
                        마지막 발급 번호
                    </div>
                    <div id="lastNumber" class="text-6xl font-bold text-white">
                        -
                    </div>
                </div>

                <!-- 대기 인원 -->
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 slide-up">
                    <div class="text-white/80 text-xl mb-4 flex items-center">
                        <i class="fas fa-users mr-3"></i>
                        대기 인원
                    </div>
                    <div class="flex items-baseline">
                        <div id="waitingCount" class="text-6xl font-bold text-white">
                            -
                        </div>
                        <div class="text-3xl text-white/70 ml-3">명</div>
                    </div>
                </div>
            </div>

            <!-- 안내 메시지 -->
            <div class="mt-8 text-center">
                <div class="bg-yellow-400/20 backdrop-blur-lg rounded-xl p-6 inline-block">
                    <p class="text-yellow-100 text-lg">
                        <i class="fas fa-info-circle mr-2"></i>
                        내 차례가 되면 번호가 표시됩니다
                    </p>
                </div>
            </div>
        </div>
    </main>

    <!-- 푸터 -->
    <footer class="bg-white/5 backdrop-blur-lg p-4">
        <div class="max-w-7xl mx-auto text-center text-white/50 text-sm">
            <i class="fas fa-sync-alt mr-2"></i>
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
