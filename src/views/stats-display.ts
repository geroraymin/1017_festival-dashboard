/**
 * 통계 디스플레이 페이지 (외부 모니터/TV용)
 */

export const statsDisplayPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>실시간 통계 - 축제 디지털방명록 시스템</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>
    <style>
        body {
            overflow: hidden;
        }
        
        .stat-number {
            font-size: 6rem;
            line-height: 1;
            font-weight: 900;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        .chart-container {
            position: relative;
            height: 400px;
        }
        
        .update-indicator {
            animation: fadeInOut 1s ease-in-out;
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        
        .fullscreen-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
    <!-- 전체화면 버튼 -->
    <button onclick="toggleFullscreen()" class="fullscreen-btn px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-lg transition flex items-center gap-2 text-gray-700">
        <i id="fullscreenIcon" class="fas fa-expand"></i>
        <span id="fullscreenText">전체화면</span>
    </button>

    <div class="container mx-auto px-4 md:px-8 py-6 h-screen flex flex-col">
        <!-- 헤더 (컴팩트) -->
        <div class="text-center mb-6">
            <div class="inline-block p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-3">
                <i class="fas fa-chart-line text-white text-3xl"></i>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-1" id="boothName">부스명 로딩 중...</h1>
            <p class="text-lg md:text-xl text-gray-600" id="eventName">행사명</p>
        </div>

        <!-- 총 참가자 수 (큰 숫자) -->
        <div class="text-center mb-6">
            <div class="inline-block bg-white rounded-3xl shadow-2xl px-12 py-8">
                <p class="text-xl md:text-2xl text-gray-600 mb-2">총 참가자</p>
                <div class="stat-number" id="totalParticipants" style="font-size: 4rem;">0</div>
                <p class="text-lg text-gray-500 mt-2">명</p>
            </div>
        </div>

        <!-- 차트 영역 (2열) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-6" style="min-height: 0;">
            <!-- 성별 분포 -->
            <div class="bg-white rounded-3xl shadow-xl p-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    <i class="fas fa-venus-mars text-pink-500 mr-2"></i>
                    성별 분포
                </h3>
                <div class="chart-container" style="height: 220px;">
                    <canvas id="genderChart"></canvas>
                </div>
                <!-- 수치 테이블 -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div id="genderStatsTable" class="grid grid-cols-2 gap-4 text-center"></div>
                </div>
            </div>

            <!-- 교급 분포 -->
            <div class="bg-white rounded-3xl shadow-xl p-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">
                    <i class="fas fa-graduation-cap text-blue-500 mr-2"></i>
                    교급 분포
                </h3>
                <div class="chart-container" style="height: 220px;">
                    <canvas id="gradeChart"></canvas>
                </div>
                <!-- 수치 테이블 -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div id="gradeStatsTable" class="grid grid-cols-5 gap-2 text-center"></div>
                </div>
            </div>
        </div>

        <!-- 업데이트 정보 -->
        <div class="text-center text-gray-600 text-base md:text-lg py-2">
            <i class="fas fa-sync-alt update-indicator mr-2"></i>
            <span>마지막 업데이트: </span>
            <span id="lastUpdate">방금 전</span>
            <span class="mx-2">|</span>
            <span id="currentTime"></span>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script>
        // URL에서 booth_id 가져오기
        const urlParams = new URLSearchParams(window.location.search)
        const boothId = urlParams.get('booth_id')

        if (!boothId) {
            alert('부스 정보가 없습니다.')
            window.location.href = '/'
        }

        let genderChart = null
        let gradeChart = null
        let lastUpdateTime = new Date()

        // 전체화면 토글
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
                document.getElementById('fullscreenIcon').className = 'fas fa-compress'
                document.getElementById('fullscreenText').textContent = '전체화면 종료'
            } else {
                document.exitFullscreen()
                document.getElementById('fullscreenIcon').className = 'fas fa-expand'
                document.getElementById('fullscreenText').textContent = '전체화면'
            }
        }

        // 현재 시간 업데이트
        function updateCurrentTime() {
            const now = new Date()
            const timeString = now.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            })
            document.getElementById('currentTime').textContent = timeString
        }

        // 마지막 업데이트 시간 표시
        function updateLastUpdateTime() {
            const now = new Date()
            const diff = Math.floor((now - lastUpdateTime) / 1000)
            
            let text = ''
            if (diff < 10) {
                text = '방금 전'
            } else if (diff < 60) {
                text = diff + '초 전'
            } else {
                const minutes = Math.floor(diff / 60)
                text = minutes + '분 전'
            }
            
            document.getElementById('lastUpdate').textContent = text
        }

        // 통계 및 부스 정보 로드 (통합)
        async function loadStats() {
            try {
                const response = await fetch(\`/api/booths/\${boothId}/public-stats\`)
                const data = await response.json()
                
                if (data.booth) {
                    // 부스 정보 업데이트
                    document.getElementById('boothName').textContent = data.booth.name
                    document.getElementById('eventName').textContent = data.booth.event_name
                }
                
                if (data.stats) {
                    // 총 참가자 수 업데이트
                    document.getElementById('totalParticipants').textContent = data.stats.total_participants

                    // 성별 분포 차트
                    updateGenderChart(data.stats.gender_distribution)

                    // 교급 분포 차트
                    updateGradeChart(data.stats.grade_distribution)

                    // 업데이트 시간 갱신
                    lastUpdateTime = new Date()
                    updateLastUpdateTime()
                }
            } catch (error) {
                console.error('통계 로드 실패:', error)
            }
        }

        // 성별 분포 차트 업데이트
        function updateGenderChart(distribution) {
            const ctx = document.getElementById('genderChart')
            
            if (genderChart) {
                genderChart.destroy()
            }

            const labels = Object.keys(distribution)
            const data = Object.values(distribution)

            genderChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',  // 남성 - 파랑
                            'rgba(236, 72, 153, 0.8)',  // 여성 - 핑크
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(236, 72, 153, 1)',
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 18,
                                    weight: 'bold'
                                },
                                padding: 20,
                                // 레전드에 수치 포함
                                generateLabels: function(chart) {
                                    const data = chart.data
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i]
                                        return {
                                            text: \`\${label}: \${value}명\`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        }
                                    })
                                }
                            }
                        },
                        tooltip: {
                            titleFont: {
                                size: 18
                            },
                            bodyFont: {
                                size: 16
                            },
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    return \`\${context.label}: \${context.parsed}명\`
                                }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            font: {
                                size: 24,
                                weight: 'bold'
                            },
                            formatter: function(value, context) {
                                return value + '명'
                            }
                        }
                    }
                }
            })
            
            // 하단 테이블 생성
            updateGenderStatsTable(distribution)
        }
        
        // 성별 통계 테이블 업데이트
        function updateGenderStatsTable(distribution) {
            const tableContainer = document.getElementById('genderStatsTable')
            tableContainer.innerHTML = ''
            
            Object.entries(distribution).forEach(([gender, count]) => {
                const statItem = document.createElement('div')
                statItem.className = 'p-3 rounded-lg bg-gray-50'
                statItem.innerHTML = \`
                    <div class="text-lg text-gray-600 mb-1">\${gender}</div>
                    <div class="text-2xl font-bold text-gray-800">\${count}<span class="text-base text-gray-500 ml-1">명</span></div>
                \`
                tableContainer.appendChild(statItem)
            })
        }

        // 교급 분포 차트 업데이트 (막대 차트)
        function updateGradeChart(distribution) {
            const ctx = document.getElementById('gradeChart')
            
            if (gradeChart) {
                gradeChart.destroy()
            }

            // 모든 교급 순서 고정 (5개 교급)
            const allGrades = ['유아', '초등', '중등', '고등', '성인']
            const labels = allGrades
            const data = allGrades.map(grade => distribution[grade] || 0)

            gradeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '참가자 수',
                        data: data,
                        backgroundColor: [
                            'rgba(251, 191, 36, 0.8)',   // 유아
                            'rgba(34, 197, 94, 0.8)',    // 초등
                            'rgba(59, 130, 246, 0.8)',   // 중등
                            'rgba(168, 85, 247, 0.8)',   // 고등
                            'rgba(99, 102, 241, 0.8)',   // 성인
                            'rgba(156, 163, 175, 0.8)',  // 기타
                        ],
                        borderColor: [
                            'rgba(251, 191, 36, 1)',
                            'rgba(34, 197, 94, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(168, 85, 247, 1)',
                            'rgba(99, 102, 241, 1)',
                            'rgba(156, 163, 175, 1)',
                        ],
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        },
                        datalabels: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: {
                                    size: 14
                                },
                                stepSize: 1
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            })
            
            // 하단 테이블 생성
            updateGradeStatsTable(distribution)
        }
        
        // 교급 통계 테이블 업데이트
        function updateGradeStatsTable(distribution) {
            const tableContainer = document.getElementById('gradeStatsTable')
            tableContainer.innerHTML = ''
            
            // 모든 교급 순서 고정 (5개 교급)
            const allGrades = ['유아', '초등', '중등', '고등', '성인']
            
            allGrades.forEach(grade => {
                const count = distribution[grade] || 0
                const statItem = document.createElement('div')
                statItem.className = 'p-2 rounded-lg bg-gray-50'
                statItem.innerHTML = \`
                    <div class="text-sm text-gray-600">\${grade}</div>
                    <div class="text-xl font-bold text-gray-800">\${count}<span class="text-sm text-gray-500 ml-1">명</span></div>
                \`
                tableContainer.appendChild(statItem)
            })
        }

        // 초기 로드
        loadStats()

        // 자동 새로고침 (10초마다)
        setInterval(loadStats, 10000)

        // 현재 시간 업데이트 (1초마다)
        setInterval(updateCurrentTime, 1000)
        updateCurrentTime()

        // 마지막 업데이트 시간 표시 (1초마다)
        setInterval(updateLastUpdateTime, 1000)
    </script>
</body>
</html>
`
