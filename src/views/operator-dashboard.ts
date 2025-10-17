/**
 * 운영자 대시보드 페이지
 */

export const operatorDashboardPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>운영자 대시보드 - 제미나이 부스</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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

            <button onclick="loadStats()" 
                class="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-between transition transform hover:scale-105">
                <div class="text-left">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-sync-alt text-blue-500 mr-2"></i>
                        통계 새로고침
                    </h3>
                    <p class="text-gray-600">최신 데이터 불러오기</p>
                </div>
                <i class="fas fa-chevron-right text-2xl text-gray-400"></i>
            </button>
        </div>

        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                    <i class="fas fa-graduation-cap text-3xl text-purple-500"></i>
                    <span class="text-3xl font-bold text-gray-800" id="elementaryCount">0</span>
                </div>
                <h3 class="text-gray-600 font-medium">초등학생</h3>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-book text-3xl text-green-500"></i>
                    <span class="text-3xl font-bold text-gray-800" id="middleHighCount">0</span>
                </div>
                <h3 class="text-gray-600 font-medium">중·고등학생</h3>
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

        // 통계 로드
        async function loadStats() {
            try {
                const response = await StatsAPI.getBooth(boothId)
                const stats = response.stats

                // 총 참가자
                document.getElementById('totalParticipants').textContent = stats.total_participants

                // 성별 통계
                document.getElementById('maleCount').textContent = stats.gender_distribution.male
                document.getElementById('femaleCount').textContent = stats.gender_distribution.female

                // 교급 통계
                document.getElementById('elementaryCount').textContent = stats.grade_distribution.elementary
                const middleHighCount = stats.grade_distribution.middle + stats.grade_distribution.high
                document.getElementById('middleHighCount').textContent = middleHighCount

                // 차트 업데이트
                updateGenderChart(stats.gender_distribution)
                updateGradeChart(stats.grade_distribution)
                updateTimeChart(stats.hourly_distribution)
            } catch (error) {
                console.error('통계 로드 실패:', error)
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
                    labels: ['남성', '여성', '기타'],
                    datasets: [{
                        data: [data.male, data.female, data.other],
                        backgroundColor: ['#3b82f6', '#ec4899', '#9ca3af']
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
                    labels: ['초등', '중등', '고등', '기타'],
                    datasets: [{
                        label: '참가자 수',
                        data: [data.elementary, data.middle, data.high, data.other],
                        backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
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

        // 초기 로드
        loadBoothInfo()
        loadStats()

        // 10초마다 자동 새로고침
        setInterval(loadStats, 10000)
    </script>
</body>
</html>
`
