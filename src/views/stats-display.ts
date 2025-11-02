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
    </style>
</head>
<body>
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
                const response = await fetch(\`/api/stats/booth/\${boothId}\`)
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

        loadStats()
        setInterval(loadStats, 10000)
    </script>
</body>
</html>
`
