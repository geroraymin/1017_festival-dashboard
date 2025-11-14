/**
 * 대기번호 티켓 페이지
 * 방명록 작성 완료 후 대기번호 표시
 */

export const queueTicketPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대기번호 발급</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @keyframes slideIn {
            from {
                transform: translateY(-30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .slide-in {
            animation: slideIn 0.5s ease-out;
        }
        .pulse-grow {
            animation: pulse 2s ease-in-out infinite;
        }
        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            background: #fbbf24;
            position: absolute;
            animation: confetti-fall 3s linear;
        }
        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen flex items-center justify-center p-4">
    <!-- 컨페티 효과 -->
    <div id="confettiContainer"></div>

    <div class="max-w-2xl w-full">
        <!-- 완료 체크 아이콘 -->
        <div class="text-center mb-8 slide-in">
            <div class="inline-block p-6 bg-green-500 rounded-full shadow-2xl mb-4">
                <i class="fas fa-check text-white text-6xl"></i>
            </div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
                방명록 작성 완료!
            </h1>
            <p class="text-gray-600 text-lg" id="thankYouMessage">
                참여해주셔서 감사합니다 🎉
            </p>
        </div>

        <!-- 대기번호 카드 -->
        <div class="bg-white rounded-3xl shadow-2xl p-8 mb-6 slide-in" style="animation-delay: 0.2s;">
            <div class="text-center mb-8">
                <div class="text-gray-600 text-xl mb-4">
                    <i class="fas fa-ticket mr-2"></i>
                    내 대기번호
                </div>
                <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-xl pulse-grow">
                    <div id="myQueueNumber" class="text-9xl font-black text-white">
                        --
                    </div>
                </div>
            </div>

            <!-- 대기 정보 -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 rounded-xl p-4 text-center">
                    <div class="text-blue-600 text-sm mb-1">
                        <i class="fas fa-arrow-right mr-1"></i>
                        현재 진행 번호
                    </div>
                    <div id="currentNumber" class="text-4xl font-bold text-blue-700">
                        --
                    </div>
                </div>
                <div class="bg-orange-50 rounded-xl p-4 text-center">
                    <div class="text-orange-600 text-sm mb-1">
                        <i class="fas fa-users mr-1"></i>
                        앞에 대기
                    </div>
                    <div class="flex items-baseline justify-center">
                        <div id="remainingCount" class="text-4xl font-bold text-orange-700">
                            --
                        </div>
                        <div class="text-xl text-orange-600 ml-2">명</div>
                    </div>
                </div>
            </div>

            <!-- 상태 메시지 -->
            <div id="statusMessage" class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center mb-6">
                <p class="text-purple-800 text-lg font-medium">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span id="statusText">대기 정보를 불러오는 중...</span>
                </p>
            </div>

            <!-- 부스 정보 -->
            <div class="text-center text-gray-600 mb-6">
                <i class="fas fa-store mr-2"></i>
                <span id="boothName">부스명</span>
            </div>

            <!-- 액션 버튼 -->
            <div class="grid grid-cols-2 gap-4">
                <button onclick="checkMyTurn()" class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg">
                    <i class="fas fa-sync-alt mr-2"></i>
                    내 차례 확인
                </button>
                <button onclick="goToGuestbook()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition transform hover:scale-105">
                    <i class="fas fa-pen mr-2"></i>
                    방명록 더 쓰기
                </button>
            </div>
        </div>

        <!-- 안내 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 slide-in" style="animation-delay: 0.4s;">
            <h3 class="font-bold text-gray-800 mb-3 flex items-center">
                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                이용 안내
            </h3>
            <ul class="space-y-2 text-gray-600">
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>부스 입구 화면에서 현재 진행 번호를 확인하세요</span>
                </li>
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>내 차례가 되면 입장해주세요</span>
                </li>
                <li class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>이 화면을 캡처하거나 번호를 기억해두세요</span>
                </li>
            </ul>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script>
        // URL에서 queue_id 가져오기
        const urlParams = new URLSearchParams(window.location.search)
        const queueId = urlParams.get('queue_id')
        const isRevisit = urlParams.get('is_revisit') === 'true'
        const previousBooth = urlParams.get('previous_booth')

        if (!queueId) {
            alert('대기 정보를 찾을 수 없습니다.')
            window.location.href = '/guestbook'
        }

        // 재방문 메시지 표시
        if (isRevisit && previousBooth) {
            document.getElementById('thankYouMessage').innerHTML = 
                '다시 방문해주셔서 감사합니다! 🎉<br>' +
                '<span class="text-sm text-gray-500">이전 방문: ' + previousBooth + '</span>'
        }

        // 컨페티 효과
        function createConfetti() {
            const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6']
            const container = document.getElementById('confettiContainer')
            
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div')
                    confetti.className = 'confetti'
                    confetti.style.left = Math.random() * 100 + '%'
                    confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
                    confetti.style.animationDelay = Math.random() * 2 + 's'
                    container.appendChild(confetti)
                    
                    setTimeout(() => confetti.remove(), 3000)
                }, i * 50)
            }
        }

        // 내 대기 상태 조회
        async function loadMyStatus() {
            try {
                const data = await QueueAPI.getMyStatus(queueId)
                
                // 대기번호 표시
                document.getElementById('myQueueNumber').textContent = data.queue_number
                document.getElementById('currentNumber').textContent = data.current_number
                document.getElementById('remainingCount').textContent = data.remaining
                document.getElementById('boothName').textContent = data.booth_name
                
                // 상태 메시지 - API의 is_my_turn 사용
                const statusText = document.getElementById('statusText')
                const statusMessage = document.getElementById('statusMessage')
                
                if (data.is_my_turn) {
                    // 정확히 내 차례 (remaining = 0)
                    statusMessage.className = 'bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-6 text-center mb-6 pulse-grow'
                    statusText.innerHTML = '<i class="fas fa-door-open mr-2"></i><strong>지금 바로 입장하세요!</strong> 🎉'
                    statusText.className = 'text-white text-2xl font-bold'
                    
                    // 알림음 (선택사항)
                    if (typeof Audio !== 'undefined') {
                        const audio = new Audio('/static/notification.mp3')
                        audio.play().catch(() => {}) // 재생 실패 무시
                    }
                } else if (data.remaining === 0) {
                    // 다음 차례 (remaining = 1)
                    statusMessage.className = 'bg-gradient-to-r from-yellow-200 to-orange-200 rounded-xl p-5 text-center mb-6'
                    statusText.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i><strong>다음 차례입니다!</strong> 준비해주세요'
                    statusText.className = 'text-orange-900 text-xl font-bold'
                } else if (data.remaining <= 2) {
                    // 곧 차례 (2-3명 남음)
                    statusMessage.className = 'bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 text-center mb-6'
                    statusText.innerHTML = '<i class="fas fa-hourglass-half mr-2"></i>곧 차례입니다 (앞에 ' + data.remaining + '명)'
                    statusText.className = 'text-orange-800 text-lg font-medium'
                } else {
                    // 대기 중 (3명 이상 남음)
                    statusMessage.className = 'bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 text-center mb-6'
                    statusText.innerHTML = '<i class="fas fa-clock mr-2"></i>대기 중입니다 (앞에 ' + data.remaining + '명)'
                    statusText.className = 'text-gray-700 text-lg font-medium'
                }
                
                console.log('[대기번호] 상태 업데이트:', data)
            } catch (error) {
                console.error('[대기번호] 상태 조회 실패:', error)
                document.getElementById('statusText').textContent = '대기 정보를 불러올 수 없습니다'
            }
        }

        // 내 차례 확인 (새로고침)
        async function checkMyTurn() {
            const btn = event.target.closest('button')
            const originalHTML = btn.innerHTML
            btn.disabled = true
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>확인 중...'
            
            await loadMyStatus()
            
            btn.disabled = false
            btn.innerHTML = originalHTML
        }

        // 방명록 더 쓰기
        function goToGuestbook() {
            if (confirm('다른 참가자 정보를 등록하시겠습니까?')) {
                window.location.href = '/guestbook'
            }
        }

        // 전역 함수 노출
        window.checkMyTurn = checkMyTurn
        window.goToGuestbook = goToGuestbook

        // 초기 로드
        createConfetti()
        loadMyStatus()

        // 30초마다 자동 새로고침
        setInterval(loadMyStatus, 30000)
    </script>
</body>
</html>
`