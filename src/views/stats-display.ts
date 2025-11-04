/**
 * 통계 디스플레이 페이지 (가로모드 최적화)
 */

export const statsDisplayPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>실시간 통계</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100vh; overflow: hidden; }
        body { 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 0.5rem;
        }
        
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .header {
            text-align: center;
            padding: 0.5rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #333;
        }
        
        .stats-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 0.5rem;
            flex: 1;
            min-height: 0;
            width: 100%;
        }
        
        .stat-card {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
        }
        
        .total-card {
            flex: 0 0 200px;
            justify-content: center;
            align-items: center;
        }
        
        .chart-card {
            flex: 1;
            min-width: 0;
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: 900;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: #666;
            margin-top: 0.25rem;
        }
        
        .chart-title {
            font-size: 1rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 0.5rem;
            text-align: center;
        }
        
        .chart-wrapper {
            flex: 1;
            position: relative;
            min-height: 0;
        }
        
        canvas {
            max-height: 100%;
        }
        
        /* 전체화면 버튼 */
        .fullscreen-btn {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            border: none;
            border-radius: 0.75rem;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            color: #667eea;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .fullscreen-btn:hover {
            background: white;
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        .fullscreen-btn:active {
            transform: scale(0.98);
        }
        
        .fullscreen-btn i {
            font-size: 1.25rem;
        }
        
        /* 전체화면 모드일 때 버튼 스타일 변경 */
        .fullscreen-active .fullscreen-btn {
            background: rgba(102, 126, 234, 0.95);
            color: white;
        }
        
        /* 세로모드 차단 */
        .portrait-warning {
            display: none;
        }
        
        @media (orientation: portrait) {
            .container {
                display: none !important;
            }
            
            .portrait-warning {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .portrait-warning i {
                font-size: 5rem;
                margin-bottom: 2rem;
                animation: rotate 2s ease-in-out infinite;
            }
            
            @keyframes rotate {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(90deg); }
            }
            
            .portrait-warning h2 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 1rem;
            }
            
            .portrait-warning p {
                font-size: 1.25rem;
                opacity: 0.9;
                line-height: 1.6;
            }
        }
    </style>
</head>
<body>
    <!-- 세로모드 경고 화면 -->
    <div class="portrait-warning">
        <i class="fas fa-mobile-screen-button"></i>
        <h2>화면을 가로로 회전해주세요</h2>
        <p>디스플레이 모드는 가로 화면 전용입니다<br>태블릿을 90도 회전해주세요</p>
    </div>
    
    <!-- 전체화면 버튼 -->
    <button class="fullscreen-btn" onclick="toggleFullscreen()">
        <i class="fas fa-expand" id="fullscreenIcon"></i>
        <span id="fullscreenText">전체화면</span>
    </button>
    
    <!-- 가로모드 정상 화면 -->
    <div class="container">
        <div class="header">
            <h1 id="boothName">부스명 로딩 중...</h1>
        </div>
        
        <div class="stats-row">
            <div class="stat-card total-card">
                <div class="stat-label">총 참가자</div>
                <div class="stat-number" id="totalParticipants">0</div>
                <div class="stat-label">명</div>
            </div>
            
            <div class="stat-card chart-card">
                <div class="chart-title">성별 분포</div>
                <div class="chart-wrapper">
                    <canvas id="genderChart"></canvas>
                </div>
            </div>
            
            <div class="stat-card chart-card">
                <div class="chart-title">교급 분포</div>
                <div class="chart-wrapper">
                    <canvas id="gradeChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script>
        const urlParams = new URLSearchParams(window.location.search)
        const boothId = urlParams.get('booth_id')

        if (!boothId) {
            alert('부스 정보가 없습니다.')
            window.location.href = '/'
        }

        let genderChart = null
        let gradeChart = null

        async function loadStats() {
            try {
                const response = await fetch(\`/api/public/stats/booth/\${boothId}\`)
                const data = await response.json()

                document.getElementById('boothName').textContent = data.booth_name || '부스명'
                document.getElementById('totalParticipants').textContent = data.total_participants || 0

                updateGenderChart(data.gender_stats)
                updateGradeChart(data.grade_stats)
            } catch (error) {
                console.error('통계 로드 실패:', error)
            }
        }

        function updateGenderChart(stats) {
            const ctx = document.getElementById('genderChart').getContext('2d')
            
            if (genderChart) genderChart.destroy()
            
            genderChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['남성', '여성'],
                    datasets: [{
                        data: [stats?.male || 0, stats?.female || 0],
                        backgroundColor: ['#3B82F6', '#EC4899']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 10 } } },
                        datalabels: {
                            color: '#fff',
                            font: { size: 14, weight: 'bold' },
                            formatter: (value) => value || ''
                        }
                    }
                },
                plugins: [ChartDataLabels]
            })
        }

        function updateGradeChart(stats) {
            const ctx = document.getElementById('gradeChart').getContext('2d')
            
            if (gradeChart) gradeChart.destroy()
            
            gradeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['초', '중', '고', '대학생', '성인'],
                    datasets: [{
                        data: [
                            stats?.elementary || 0,
                            stats?.middle || 0,
                            stats?.high || 0,
                            stats?.university || 0,
                            stats?.adult || 0
                        ],
                        backgroundColor: '#8B5CF6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            font: { size: 12, weight: 'bold' },
                            formatter: (value) => value || ''
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 10 } } },
                        x: { ticks: { font: { size: 10 } } }
                    }
                },
                plugins: [ChartDataLabels]
            })
        }

        // 전체화면 토글 함수
        function toggleFullscreen() {
            const icon = document.getElementById('fullscreenIcon')
            const text = document.getElementById('fullscreenText')
            
            if (!document.fullscreenElement) {
                // 전체화면 모드로 진입
                document.documentElement.requestFullscreen().then(() => {
                    icon.className = 'fas fa-compress'
                    text.textContent = '전체화면 종료'
                    document.body.classList.add('fullscreen-active')
                }).catch(err => {
                    console.error('전체화면 진입 실패:', err)
                    alert('전체화면 모드를 지원하지 않는 브라우저입니다.')
                })
            } else {
                // 전체화면 종료
                document.exitFullscreen().then(() => {
                    icon.className = 'fas fa-expand'
                    text.textContent = '전체화면'
                    document.body.classList.remove('fullscreen-active')
                }).catch(err => {
                    console.error('전체화면 종료 실패:', err)
                })
            }
        }
        
        // 전체화면 상태 변경 감지 (ESC 키 등으로 종료 시)
        document.addEventListener('fullscreenchange', () => {
            const icon = document.getElementById('fullscreenIcon')
            const text = document.getElementById('fullscreenText')
            
            if (!document.fullscreenElement) {
                icon.className = 'fas fa-expand'
                text.textContent = '전체화면'
                document.body.classList.remove('fullscreen-active')
            }
        })

        loadStats()
        setInterval(loadStats, 10000)
    </script>
</body>
</html>
`
