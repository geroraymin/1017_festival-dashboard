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
    <link href="/static/style.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        /* 큐 티켓 페이지 전용 스타일 */
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-4);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .ticket-container {
            max-width: 600px;
            width: 100%;
        }

        /* 완료 체크 아이콘 */
        .success-icon {
            text-align: center;
            margin-bottom: var(--space-8);
        }

        .success-icon-circle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, var(--color-success), #28a745);
            border-radius: 50%;
            box-shadow: var(--shadow-xl);
            margin-bottom: var(--space-4);
        }

        .success-icon-circle i {
            font-size: 3.5rem;
            color: white;
        }

        /* 큐 번호 카드 */
        .queue-number-display {
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            border-radius: var(--radius-2xl);
            padding: var(--space-8);
            box-shadow: var(--shadow-xl);
            text-align: center;
            margin-bottom: var(--space-6);
        }

        .queue-number-value {
            font-size: 8rem;
            font-weight: 900;
            color: white;
            line-height: 1;
            letter-spacing: -0.02em;
        }

        /* 대기 정보 그리드 */
        .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-4);
            margin-bottom: var(--space-6);
        }

        .status-item {
            padding: var(--space-5);
            border-radius: var(--radius-xl);
            text-align: center;
        }

        .status-item-label {
            font-size: 0.875rem;
            color: var(--color-text-tertiary);
            margin-bottom: var(--space-2);
            font-weight: 600;
        }

        .status-item-value {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1;
        }

        .status-item-current {
            background-color: rgba(0, 122, 255, 0.1);
        }

        .status-item-current .status-item-value {
            color: var(--color-primary);
        }

        .status-item-remaining {
            background-color: rgba(255, 149, 0, 0.1);
        }

        .status-item-remaining .status-item-value {
            color: var(--color-warning);
        }

        /* 상태 메시지 박스 */
        .status-alert {
            padding: var(--space-5);
            border-radius: var(--radius-xl);
            text-align: center;
            margin-bottom: var(--space-6);
            transition: all var(--transition-base);
        }

        .status-alert-my-turn {
            background: linear-gradient(135deg, var(--color-success), #28a745);
            color: white;
            padding: var(--space-8);
        }

        .status-alert-next {
            background: linear-gradient(135deg, var(--color-warning), #e08600);
            color: white;
        }

        .status-alert-soon {
            background-color: var(--color-warning-bg);
            color: var(--color-warning-hover);
        }

        .status-alert-waiting {
            background-color: var(--color-bg-tertiary);
            color: var(--color-text-secondary);
        }

        /* 부스 정보 */
        .booth-info {
            text-align: center;
            margin-bottom: var(--space-6);
            color: var(--color-text-inverse);
        }

        /* 액션 버튼 */
        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-4);
        }

        /* 안내 섹션 */
        .info-section {
            margin-top: var(--space-6);
        }

        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .info-list li {
            display: flex;
            align-items: flex-start;
            margin-bottom: var(--space-3);
            color: var(--color-text-secondary);
        }

        .info-list li i {
            margin-right: var(--space-3);
            margin-top: 2px;
            color: var(--color-success);
        }

        /* 컨페티 효과 */
        #confettiContainer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }

        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: var(--color-warning);
            animation: confetti-fall 3s linear;
        }

        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }

        /* 반응형 디자인 */
        @media (max-width: 640px) {
            .queue-number-value {
                font-size: 5rem;
            }

            .status-item-value {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body class="service-page service-ticket">
    <!-- 컨페티 효과 -->
    <div id="confettiContainer" aria-hidden="true"></div>

    <main class="ticket-container" role="main">
        <!-- 완료 체크 아이콘 -->
        <header class="success-icon fade-in">
            <div class="success-icon-circle" aria-label="완료">
                <i class="fas fa-check" aria-hidden="true"></i>
            </div>
            <h1 class="text-title1" style="color: white; margin-bottom: var(--space-2);">
                방명록 작성 완료!
            </h1>
            <p class="text-body" style="color: rgba(255, 255, 255, 0.9);" id="thankYouMessage">
                참여해주셔서 감사합니다 🎉
            </p>
        </header>

        <!-- 대기번호 카드 -->
        <div class="card card-lg fade-in" style="animation-delay: 0.2s;">
            <!-- 내 대기번호 -->
            <section style="margin-bottom: var(--space-8);">
                <div class="text-headline" style="text-align: center; margin-bottom: var(--space-4); color: var(--color-text-secondary);">
                    <i class="fas fa-ticket" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    내 대기번호
                </div>
                <div class="queue-number-display pulse-grow" role="region" aria-label="대기번호">
                    <div id="myQueueNumber" class="queue-number-value" aria-live="polite">
                        --
                    </div>
                </div>
            </section>

            <!-- 대기 정보 -->
            <div class="status-grid">
                <div class="status-item status-item-current">
                    <div class="status-item-label">
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        현재 진행 번호
                    </div>
                    <div id="currentNumber" class="status-item-value" aria-live="polite">
                        --
                    </div>
                </div>
                <div class="status-item status-item-remaining">
                    <div class="status-item-label">
                        <i class="fas fa-users" aria-hidden="true"></i>
                        앞에 대기
                    </div>
                    <div style="display: flex; align-items: baseline; justify-content: center;">
                        <div id="remainingCount" class="status-item-value" aria-live="polite">
                            --
                        </div>
                        <div class="text-headline" style="margin-left: var(--space-2); color: var(--color-warning);">명</div>
                    </div>
                </div>
            </div>

            <!-- 상태 메시지 -->
            <div id="statusMessage" class="status-alert status-alert-waiting" role="status" aria-live="assertive">
                <p class="text-body" style="margin: 0; font-weight: 600;">
                    <i class="fas fa-info-circle" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    <span id="statusText">대기 정보를 불러오는 중...</span>
                </p>
            </div>

            <!-- 부스 정보 -->
            <div class="booth-info text-body">
                <i class="fas fa-store" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                <span id="boothName">부스명</span>
            </div>

            <!-- 액션 버튼 -->
            <div class="action-buttons">
                <button onclick="checkMyTurn()" class="btn btn-primary btn-lg" aria-label="내 차례 확인">
                    <i class="fas fa-sync-alt" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    내 차례 확인
                </button>
                <button onclick="goToGuestbook()" class="btn btn-secondary btn-lg" aria-label="방명록 추가 작성">
                    <i class="fas fa-pen" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    방명록 더 쓰기
                </button>
            </div>
        </div>

        <!-- 안내 -->
        <aside class="card info-section fade-in" style="animation-delay: 0.4s;" aria-labelledby="info-heading">
            <h2 id="info-heading" class="text-headline" style="margin-bottom: var(--space-4); display: flex; align-items: center;">
                <i class="fas fa-lightbulb" aria-hidden="true" style="color: var(--color-warning); margin-right: var(--space-2);"></i>
                이용 안내
            </h2>
            <ul class="info-list">
                <li>
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    <span>부스 입구 화면에서 현재 진행 번호를 확인하세요</span>
                </li>
                <li>
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    <span>내 차례가 되면 입장해주세요</span>
                </li>
                <li>
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    <span>이 화면을 캡처하거나 번호를 기억해두세요</span>
                </li>
            </ul>
        </aside>
    </main>

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
                
                if (data.is_my_turn || data.remaining === 0) {
                    // 정확히 내 차례 (is_my_turn 또는 앞에 0명)
                    statusMessage.className = 'status-alert status-alert-my-turn pulse-grow'
                    statusText.innerHTML = '<i class="fas fa-door-open" aria-hidden="true" style="margin-right: var(--space-2);"></i><strong>지금 바로 입장하세요!</strong> 🎉'
                    statusText.style = 'font-size: 1.375rem; font-weight: 700; margin: 0;'
                    
                    // 알림음 (선택사항)
                    if (typeof Audio !== 'undefined') {
                        const audio = new Audio('/static/notification.mp3')
                        audio.play().catch(() => {}) // 재생 실패 무시
                    }
                } else if (data.remaining === 1) {
                    // 다음 차례 (1명 남음)
                    statusMessage.className = 'status-alert status-alert-next'
                    statusText.innerHTML = '<i class="fas fa-exclamation-triangle" aria-hidden="true" style="margin-right: var(--space-2);"></i><strong>다음 차례입니다!</strong> 준비해주세요'
                    statusText.style = 'font-size: 1.25rem; font-weight: 700; margin: 0;'
                } else if (data.remaining <= 3) {
                    // 곧 차례 (2-3명 남음)
                    statusMessage.className = 'status-alert status-alert-soon'
                    statusText.innerHTML = '<i class="fas fa-hourglass-half" aria-hidden="true" style="margin-right: var(--space-2);"></i>곧 차례입니다 (앞에 ' + data.remaining + '명)'
                    statusText.style = 'font-size: 1.0625rem; font-weight: 600; margin: 0;'
                } else {
                    // 대기 중 (4명 이상 남음)
                    statusMessage.className = 'status-alert status-alert-waiting'
                    statusText.innerHTML = '<i class="fas fa-clock" aria-hidden="true" style="margin-right: var(--space-2);"></i>대기 중입니다 (앞에 ' + data.remaining + '명)'
                    statusText.style = 'font-size: 1.0625rem; font-weight: 600; margin: 0;'
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
            btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true" style="margin-right: var(--space-2);"></i>확인 중...'
            
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
