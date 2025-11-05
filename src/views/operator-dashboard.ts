/**
 * 운영자 대시보드 페이지
 */

export const operatorDashboardPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>운영자 대시보드 - 축제 디지털방명록 시스템</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        /* 스켈레톤 로더 애니메이션 */
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
            border-radius: 8px;
        }
        .skeleton-text {
            height: 1rem;
            margin-bottom: 0.5rem;
        }
        .skeleton-title {
            height: 2rem;
            width: 60%;
            margin-bottom: 1rem;
        }
        .skeleton-card {
            height: 120px;
        }
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #14b8a6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-teal-50 to-cyan-50 min-h-screen">
    <!-- 헤더 -->
    <header class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-teal-500 rounded-lg">
                    <i class="fas fa-store text-white text-xl"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-gray-800">운영자 대시보드</h1>
                    <p class="text-sm text-gray-600" id="boothName">부스명 로딩 중...</p>
                </div>
            </div>
            <button onclick="logout()" class="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                <i class="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
            </button>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- 부스 정보 카드 -->
        <div class="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-3xl font-bold mb-2" id="boothNameLarge">부스명</h2>
                    <p class="text-teal-100 mb-4" id="eventName">행사명</p>
                    <div class="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg inline-block">
                        <i class="fas fa-key"></i>
                        <span class="font-mono font-bold" id="boothCode">------</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-5xl font-bold mb-2" id="totalParticipants">0</div>
                    <div class="text-teal-100">총 참가자</div>
                </div>
            </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <a href="#" onclick="openGuestbook(); return false;" 
                class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:scale-105">
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-pen-fancy text-teal-500 mr-2"></i>
                        방명록 작성
                    </h3>
                    <p class="text-gray-600">참가자 정보 등록하기</p>
                </div>
                <i class="fas fa-chevron-right text-2xl text-gray-400"></i>
            </a>

            <button onclick="exportBoothCSV()" 
                class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:scale-105">
                <div class="text-left">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-file-csv text-green-500 mr-2"></i>
                        CSV 다운로드
                    </h3>
                    <p class="text-gray-600">참가자 명단 저장</p>
                </div>
                <i class="fas fa-chevron-right text-2xl text-gray-400"></i>
            </button>

            <button onclick="sendCSVEmail()" 
                class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:scale-105">
                <div class="text-left">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-envelope text-blue-500 mr-2"></i>
                        이메일로 받기
                    </h3>
                    <p class="text-gray-600">CSV를 이메일로 전송</p>
                </div>
                <i class="fas fa-chevron-right text-2xl text-gray-400"></i>
            </button>

            <button onclick="openDisplayMode()" 
                class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:scale-105">
                <div class="text-left">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-tv text-purple-500 mr-2"></i>
                        디스플레이 모드
                    </h3>
                    <p class="text-gray-600">통계 크게 보기</p>
                </div>
                <i class="fas fa-chevron-right text-2xl text-gray-400"></i>
            </button>

            <button id="refreshButton" onclick="refreshStats()" 
                class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:scale-105">
                <div class="text-left">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i id="refreshIcon" class="fas fa-sync-alt text-blue-500 mr-2"></i>
                        <span id="refreshText">통계 새로고침</span>
                    </h3>
                    <p class="text-gray-600">최신 데이터 불러오기</p>
                </div>
                <i class="fas fa-chevron-right text-2xl text-gray-400"></i>
            </button>
        </div>

        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="statsCards">
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-mars text-3xl text-blue-500"></i>
                    <span class="text-3xl font-bold text-gray-800" id="maleCount">0</span>
                </div>
                <h3 class="text-gray-600 font-medium">남성</h3>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-venus text-3xl text-pink-500"></i>
                    <span class="text-3xl font-bold text-gray-800" id="femaleCount">0</span>
                </div>
                <h3 class="text-gray-600 font-medium">여성</h3>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-baby text-3xl text-yellow-500"></i>
                    <span class="text-3xl font-bold text-gray-800" id="infantCount">0</span>
                </div>
                <h3 class="text-gray-600 font-medium">유아</h3>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-user-tie text-3xl text-indigo-500"></i>
                    <span class="text-3xl font-bold text-gray-800" id="adultCount">0</span>
                </div>
                <h3 class="text-gray-600 font-medium">성인</h3>
            </div>
        </div>

        <!-- 로딩 스켈레톤 (초기 상태) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 hidden" id="statsCardsLoading">
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="skeleton skeleton-card"></div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="skeleton skeleton-card"></div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="skeleton skeleton-card"></div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="skeleton skeleton-card"></div>
            </div>
        </div>

        <!-- 차트 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- 성별 분포 차트 -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-chart-pie text-teal-500 mr-2"></i>
                    성별 분포
                </h3>
                <canvas id="genderChart"></canvas>
            </div>

            <!-- 교급 분포 차트 -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-chart-bar text-purple-500 mr-2"></i>
                    교급 분포
                </h3>
                <canvas id="gradeChart"></canvas>
            </div>
        </div>

        <!-- 시간대별 참가자 차트 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-chart-line text-blue-500 mr-2"></i>
                시간대별 참가자
            </h3>
            <canvas id="timeChart"></canvas>
        </div>
    </main>

    <script src="/static/js/api.js"></script>
    <script>
        let genderChart, gradeChart, timeChart
        let boothId

        // 인증 확인
        const user = getUser()
        if (!user || user.role !== 'operator') {
            alert('운영자 권한이 필요합니다.')
            window.location.href = '/operator'
        }

        boothId = user.booth_id

        // 로그아웃
        function logout() {
            if (confirm('로그아웃하시겠습니까?')) {
                clearToken()
                window.location.href = '/'
            }
        }

        // 방명록 페이지 열기
        function openGuestbook() {
            window.open(\`/guestbook?booth_id=\${boothId}\`, '_blank')
        }

        // 디스플레이 모드 열기
        function openDisplayMode() {
            window.open(\`/display?booth_id=\${boothId}\`, '_blank', 'width=1920,height=1080')
        }

        // 부스 정보 로드
        async function loadBoothInfo() {
            try {
                const response = await BoothsAPI.getOne(boothId)
                const booth = response.booth

                document.getElementById('boothName').textContent = booth.name
                document.getElementById('boothNameLarge').textContent = booth.name
                document.getElementById('boothCode').textContent = booth.booth_code
                
                if (booth.events) {
                    document.getElementById('eventName').textContent = booth.events.name
                }
            } catch (error) {
                console.error('부스 정보 로드 실패:', error)
            }
        }

        // 로딩 상태 토글
        function showLoading() {
            document.getElementById('statsCards').classList.add('hidden')
            document.getElementById('statsCardsLoading').classList.remove('hidden')
        }

        function hideLoading() {
            document.getElementById('statsCards').classList.remove('hidden')
            document.getElementById('statsCardsLoading').classList.add('hidden')
        }

        // 새로고침 버튼 클릭 핸들러
        async function refreshStats() {
            const refreshButton = document.getElementById('refreshButton')
            const refreshIcon = document.getElementById('refreshIcon')
            const refreshText = document.getElementById('refreshText')
            
            // 버튼 비활성화 및 로딩 표시
            refreshButton.disabled = true
            refreshIcon.classList.add('fa-spin')
            refreshText.textContent = '새로고침 중...'
            
            await loadStats()
            
            // 버튼 활성화 및 원래 상태로
            refreshButton.disabled = false
            refreshIcon.classList.remove('fa-spin')
            refreshText.textContent = '통계 새로고침'
        }

        // 통계 로드
        async function loadStats() {
            showLoading()
            try {
                const response = await StatsAPI.getBooth(boothId)
                const stats = response.stats

                // 총 참가자
                document.getElementById('totalParticipants').textContent = stats.total_participants

                // 성별 통계
                document.getElementById('maleCount').textContent = stats.gender_distribution['남성'] || 0
                document.getElementById('femaleCount').textContent = stats.gender_distribution['여성'] || 0

                // 교급 통계
                document.getElementById('infantCount').textContent = stats.grade_distribution['유아'] || 0
                document.getElementById('adultCount').textContent = stats.grade_distribution['성인'] || 0

                // 차트 업데이트
                updateGenderChart(stats.gender_distribution)
                updateGradeChart(stats.grade_distribution)
                updateTimeChart(stats.hourly_distribution)
                
                hideLoading()
            } catch (error) {
                console.error('통계 로드 실패:', error)
                hideLoading()
                alert('통계 데이터를 불러오는데 실패했습니다.')
            }
        }

        // 성별 분포 차트
        function updateGenderChart(data) {
            const ctx = document.getElementById('genderChart').getContext('2d')
            
            if (genderChart) {
                genderChart.destroy()
            }

            genderChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['남성', '여성'],
                    datasets: [{
                        data: [data['남성'] || 0, data['여성'] || 0],
                        backgroundColor: ['#3b82f6', '#ec4899']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            })
        }

        // 교급 분포 차트
        function updateGradeChart(data) {
            const ctx = document.getElementById('gradeChart').getContext('2d')
            
            if (gradeChart) {
                gradeChart.destroy()
            }

            gradeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['유아', '초등', '중등', '고등', '성인'],
                    datasets: [{
                        label: '참가자 수',
                        data: [
                            data['유아'] || 0,
                            data['초등'] || 0,
                            data['중등'] || 0,
                            data['고등'] || 0,
                            data['성인'] || 0
                        ],
                        backgroundColor: ['#fbbf24', '#34d399', '#3b82f6', '#a78bfa', '#6366f1']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            })
        }

        // 시간대별 참가자 차트
        function updateTimeChart(data) {
            const ctx = document.getElementById('timeChart').getContext('2d')
            
            if (timeChart) {
                timeChart.destroy()
            }

            // 시간대 데이터 정렬
            const hours = Object.keys(data).sort()
            const counts = hours.map(h => data[h])

            timeChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: hours,
                    datasets: [{
                        label: '참가자 수',
                        data: counts,
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            })
        }

        // CSV 내보내기 (부스 운영자용)
        async function exportBoothCSV() {
            try {
                // 해당 부스의 참가자 데이터 가져오기 (서버에서 이미 필터링됨)
                const response = await ParticipantsAPI.getAll()
                const boothParticipants = response.participants || []
                
                console.log('CSV Export - boothId:', boothId)
                console.log('CSV Export - participants:', boothParticipants.length)
                console.log('CSV Export - first participant:', boothParticipants[0])
                
                if (boothParticipants.length === 0) {
                    alert('내보낼 참가자 데이터가 없습니다.')
                    return
                }
                
                // CSV 헤더 (UTF-8 BOM 추가)
                let csv = '\\uFEFF이름,성별,교급,생년월일,등록일시\\n'
                
                // CSV 데이터 (부스명 제외 - 자신의 부스니까 불필요)
                boothParticipants.forEach(p => {
                    const createdAt = new Date(p.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })
                    csv += \`\${p.name},\${p.gender},\${p.grade},\${p.date_of_birth},\${createdAt}\\n\`
                })
                
                // 다운로드
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                
                // 파일명: booth_부스명_날짜.csv
                const boothName = document.getElementById('boothNameLarge').textContent
                const filename = \`booth_\${boothName}_\${new Date().toISOString().split('T')[0]}.csv\`
                link.setAttribute('download', filename)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                alert(\`\${boothParticipants.length}명의 참가자 데이터를 내보냈습니다.\`)
            } catch (error) {
                console.error('CSV 내보내기 실패:', error)
                alert('CSV 다운로드에 실패했습니다: ' + error.message)
            }
        }

        // 이메일로 CSV 전송
        async function sendCSVEmail() {
            // 이메일 주소 입력 받기
            const email = prompt('CSV를 받을 이메일 주소를 입력하세요:')
            
            if (!email) {
                return // 취소한 경우
            }
            
            // 간단한 이메일 형식 검증
            if (!email.includes('@') || !email.includes('.')) {
                alert('유효한 이메일 주소를 입력해주세요.')
                return
            }
            
            try {
                const response = await EmailAPI.sendCSV(email)
                alert(response.message || '이메일이 전송되었습니다!')
            } catch (error) {
                console.error('이메일 전송 실패:', error)
                alert('이메일 전송에 실패했습니다: ' + error.message)
            }
        }

        // 초기 로드
        loadBoothInfo()
        loadStats()

        // 10초마다 자동 새로고침
        setInterval(loadStats, 10000)
    </script>
</body>
</html>
`
