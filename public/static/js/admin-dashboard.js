/**
 * 관리자 대시보드 JavaScript
 */

let overallGenderChart, overallGradeChart, overallBoothChart
let allEvents = []
let allBooths = []
let allParticipants = []
let selectedEventId = '' // 선택된 행사 ID (빈 문자열 = 전체)

// 인증 확인
const user = getUser()
if (!user || user.role !== 'admin') {
    alert('관리자 권한이 필요합니다.')
    window.location.href = '/admin'
}

document.getElementById('adminName').textContent = user.username || '관리자'

// 로그아웃
function logout() {
    if (confirm('로그아웃하시겠습니까?')) {
        clearToken()
        window.location.href = '/'
    }
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active')
    })
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600')
        btn.classList.add('border-transparent', 'text-gray-600')
    })

    // 선택된 탭 활성화
    document.getElementById(`tab-${tabName}`).classList.add('active')
    event.target.classList.add('active', 'border-indigo-600', 'text-indigo-600')
    event.target.classList.remove('border-transparent', 'text-gray-600')

    // 탭별 데이터 로드
    if (tabName === 'overview') {
        loadOverview()
    } else if (tabName === 'events') {
        loadEvents()
    } else if (tabName === 'booths') {
        loadBooths()
    } else if (tabName === 'participants') {
        loadParticipants()
    }
}

// 통계 개요 로드
async function loadOverview() {
    try {
        const data = await StatsAPI.getAll()

        // 행사 필터 드롭다운 채우기 (최초 로드 시)
        const eventFilter = document.getElementById('eventFilter')
        if (eventFilter.options.length === 1) { // "전체 행사"만 있을 때
            data.events.forEach(event => {
                const option = document.createElement('option')
                const eventId = event.id || event.event_id
                const eventName = event.name || event.event_name
                option.value = eventId
                option.textContent = eventName
                eventFilter.appendChild(option)
            })
        }
        
        // 선택된 값 유지
        if (selectedEventId) {
            eventFilter.value = selectedEventId
        }

        // 선택된 행사 필터링
        let filteredEvents = data.events
        if (selectedEventId) {
            filteredEvents = data.events.filter(event => {
                const eventId = event.id || event.event_id
                return eventId === selectedEventId
            })
            console.log('🔍 선택된 행사 ID:', selectedEventId)
            console.log('🔍 필터링된 행사:', filteredEvents)
        }

        // 총 참가자 계산 (필터링된 행사 기준)
        let totalParticipants = 0
        console.log('📊 [통계 개요] 데이터 구조 분석 시작')
        console.log('전체 행사 수:', filteredEvents.length)
        
        filteredEvents.forEach((event, eventIndex) => {
            console.log(`\n행사 ${eventIndex + 1}:`, event.name || event.event_name)
            console.log('  - 행사 ID:', event.id || event.event_id)
            console.log('  - 부스 수:', event.booths?.length || 0)
            
            if (event.booths) {
                event.booths.forEach((booth, boothIndex) => {
                    // total_participants 또는 participant_count 사용
                    const count = booth.total_participants || booth.participant_count || 0
                    console.log(`    부스 ${boothIndex + 1}:`, booth.name || booth.booth_name)
                    console.log('      - total_participants:', booth.total_participants)
                    console.log('      - participant_count:', booth.participant_count)
                    console.log('      - 사용할 값:', count)
                    
                    totalParticipants += count
                })
            }
        })
        
        console.log('\n✅ 총 참가자 수:', totalParticipants)
        console.log('타입:', typeof totalParticipants)
        console.log('isNaN:', isNaN(totalParticipants))
        
        // Fallback: NaN이면 0으로 표시
        const displayValue = isNaN(totalParticipants) ? 0 : totalParticipants
        document.getElementById('totalParticipants').textContent = displayValue

        // 행사 및 부스 수 (필터링된 기준)
        document.getElementById('totalEvents').textContent = filteredEvents.length

        let totalBooths = 0
        filteredEvents.forEach(event => {
            totalBooths += event.booth_count
        })
        document.getElementById('totalBooths').textContent = totalBooths

        // 마지막 업데이트 시간
        const now = new Date()
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        })

        // 성별/교급 분포 계산 (필터링된 행사 기준)
        let genderDistribution = { '남성': 0, '여성': 0 }
        let gradeDistribution = { '유아': 0, '초등': 0, '중등': 0, '고등': 0, '성인': 0 }

        filteredEvents.forEach(event => {
            if (event.booths) {
                event.booths.forEach(booth => {
                    // Fallback: undefined 방지
                    if (booth.gender_distribution) {
                        Object.entries(booth.gender_distribution).forEach(([gender, count]) => {
                            if (genderDistribution[gender] !== undefined) {
                                genderDistribution[gender] += count || 0
                            }
                        })
                    }

                    if (booth.grade_distribution) {
                        Object.entries(booth.grade_distribution).forEach(([grade, count]) => {
                            if (gradeDistribution[grade] !== undefined) {
                                gradeDistribution[grade] += count || 0
                            }
                        })
                    }
                })
            }
        })
        
        console.log('📊 성별 분포:', genderDistribution)
        console.log('📊 교급 분포:', gradeDistribution)
        
        console.log('📊 성별 분포:', genderDistribution)
        console.log('📊 교급 분포:', gradeDistribution)

        // 부스별 데이터 수집
        let boothData = []
        filteredEvents.forEach(event => {
            if (event.booths) {
                event.booths.forEach(booth => {
                    boothData.push({
                        name: booth.name || booth.booth_name,
                        count: booth.total_participants || booth.participant_count || 0
                    })
                })
            }
        })
        // 참가자 수 많은 순으로 정렬
        boothData.sort((a, b) => b.count - a.count)
        // 상위 10개만 표시
        boothData = boothData.slice(0, 10)
        
        console.log('📊 부스별 데이터 (loadOverview):', boothData)

        updateOverallGenderChart(genderDistribution)
        updateOverallGradeChart(gradeDistribution)
        updateOverallBoothChart(boothData)
    } catch (error) {
        console.error('통계 개요 로드 실패:', error)
    }
}

// 전체 성별 분포 차트
function updateOverallGenderChart(data) {
    const ctx = document.getElementById('overallGenderChart').getContext('2d')

    if (overallGenderChart) {
        overallGenderChart.destroy()
    }

    const labels = Object.keys(data)
    const values = Object.values(data)

    overallGenderChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
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
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 15,
                        generateLabels: function(chart) {
                            const data = chart.data
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i]
                                return {
                                    text: `${label}: ${value}명`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }
                            })
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
                        return value + '명'
                    }
                }
            }
        }
    })

    // 성별 통계 테이블 업데이트
    updateGenderStatsTable(data)
}

// 성별 통계 테이블 업데이트
function updateGenderStatsTable(data) {
    const tableContainer = document.getElementById('genderStatsTable')
    tableContainer.innerHTML = ''
    
    Object.entries(data).forEach(([gender, count]) => {
        const statItem = document.createElement('div')
        statItem.className = 'p-3 rounded-lg bg-gray-50'
        statItem.innerHTML = `
            <div class="text-base text-gray-600 mb-1">${gender}</div>
            <div class="text-2xl font-bold text-gray-800">${count}<span class="text-sm text-gray-500 ml-1">명</span></div>
        `
        tableContainer.appendChild(statItem)
    })
}

// 전체 교급 분포 차트
function updateOverallGradeChart(data) {
    const ctx = document.getElementById('overallGradeChart').getContext('2d')

    if (overallGradeChart) {
        overallGradeChart.destroy()
    }

    // 모든 교급 순서 고정 (5개 교급)
    const allGrades = ['유아', '초등', '중등', '고등', '성인']
    const labels = allGrades
    const values = allGrades.map(grade => data[grade] || 0)

    overallGradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '참가자 수',
                data: values,
                backgroundColor: [
                    'rgba(251, 191, 36, 0.8)',   // 유아
                    'rgba(34, 197, 94, 0.8)',    // 초등
                    'rgba(59, 130, 246, 0.8)',   // 중등
                    'rgba(168, 85, 247, 0.8)',   // 고등
                    'rgba(99, 102, 241, 0.8)',   // 성인
                ],
                borderColor: [
                    'rgba(251, 191, 36, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(99, 102, 241, 1)',
                ],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
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
                            size: 12
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
                            size: 12,
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

    // 교급 통계 테이블 업데이트
    updateGradeStatsTable(data)
}

// 교급 통계 테이블 업데이트
function updateGradeStatsTable(data) {
    const tableContainer = document.getElementById('gradeStatsTable')
    tableContainer.innerHTML = ''
    
    // 모든 교급 순서 고정 (5개 교급)
    const allGrades = ['유아', '초등', '중등', '고등', '성인']
    
    allGrades.forEach(grade => {
        const count = data[grade] || 0
        const statItem = document.createElement('div')
        statItem.className = 'p-2 rounded-lg bg-gray-50'
        statItem.innerHTML = `
            <div class="text-xs text-gray-600">${grade}</div>
            <div class="text-lg font-bold text-gray-800">${count}<span class="text-xs text-gray-500 ml-1">명</span></div>
        `
        tableContainer.appendChild(statItem)
    })
}

// 부스별 차트 업데이트
function updateOverallBoothChart(boothData) {
    const ctx = document.getElementById('overallBoothChart')
    if (!ctx) return

    // 기존 차트 제거
    if (overallBoothChart) {
        overallBoothChart.destroy()
    }

    // 데이터가 없을 때 처리
    if (!boothData || boothData.length === 0) {
        boothData = [{ name: '데이터 없음', count: 0 }]
    }

    overallBoothChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: boothData.map(booth => booth.name),
            datasets: [{
                label: '참가자 수',
                data: boothData.map(booth => booth.count),
                backgroundColor: [
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)'
                ],
                borderColor: [
                    'rgb(236, 72, 153)',
                    'rgb(168, 85, 247)',
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(34, 197, 94)',
                    'rgb(249, 115, 22)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y', // 가로 막대형 차트
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return '참가자: ' + context.parsed.x + '명'
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    })
}

// 행사 목록 로드
async function loadEvents() {
    try {
        const data = await EventsAPI.getAll()
        allEvents = data.events

        const tbody = document.getElementById('eventsTableBody')
        tbody.innerHTML = ''

        if (allEvents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        등록된 행사가 없습니다.
                    </td>
                </tr>
            `
            return
        }

        // 각 행사별 통계 로드
        for (const event of allEvents) {
            const boothsData = await BoothsAPI.getAll(event.id)
            const boothCount = boothsData.booths.length

            // 참가자 수 계산 - 해당 행사의 모든 부스의 참가자 수 합산
            let participantCount = 0
            for (const booth of boothsData.booths) {
                const participantsData = await ParticipantsAPI.getAll({ booth_id: booth.id })
                participantCount += participantsData.total || participantsData.participants.length
            }

            const row = document.createElement('tr')
            row.className = 'hover:bg-gray-50'
            row.innerHTML = `
                <td class="px-6 py-4" data-label="행사명">
                    <div class="font-medium text-gray-900">${event.name}</div>
                </td>
                <td class="px-6 py-4 text-gray-600" data-label="기간">
                    ${formatDate(event.start_date)} ~ ${formatDate(event.end_date)}
                </td>
                <td class="px-6 py-4 text-gray-600" data-label="부스">
                    ${boothCount}개
                </td>
                <td class="px-6 py-4 text-gray-600" data-label="참가자">
                    ${participantCount}명
                </td>
                <td class="px-6 py-4" data-label="상태">
                    <span class="px-3 py-1 text-sm rounded-full ${event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${event.is_active ? '활성' : '비활성'}
                    </span>
                </td>
                <td class="px-6 py-4" data-label="관리">
                    <button onclick="toggleEvent('${event.id}')" class="text-blue-600 hover:text-blue-800 mr-3" title="활성화/비활성화">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button onclick="deleteEvent('${event.id}')" class="text-red-600 hover:text-red-800" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
            tbody.appendChild(row)
        }
    } catch (error) {
        console.error('행사 목록 로드 실패:', error)
    }
}

// 부스 목록 로드
async function loadBooths() {
    try {
        const data = await BoothsAPI.getAll()
        allBooths = data.booths

        const tbody = document.getElementById('boothsTableBody')
        tbody.innerHTML = ''

        if (allBooths.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        등록된 부스가 없습니다.
                    </td>
                </tr>
            `
            return
        }

        for (const booth of allBooths) {
            // 참가자 수 계산 - 해당 부스의 참가자 수
            const participantsData = await ParticipantsAPI.getAll({ booth_id: booth.id })
            const participantCount = participantsData.total || participantsData.participants.length

            const row = document.createElement('tr')
            row.className = 'hover:bg-gray-50'
            row.innerHTML = `
                <td class="px-6 py-4" data-label="부스명">
                    <div class="font-medium text-gray-900">${booth.name}</div>
                </td>
                <td class="px-6 py-4 text-gray-600" data-label="행사">
                    ${booth.events?.name || '-'}
                </td>
                <td class="px-6 py-4" data-label="코드">
                    <span class="font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded">${booth.booth_code}</span>
                </td>
                <td class="px-6 py-4 text-gray-600" data-label="참가자">
                    ${participantCount}명
                </td>
                <td class="px-6 py-4" data-label="상태">
                    <span class="px-3 py-1 text-sm rounded-full ${booth.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${booth.is_active ? '활성' : '비활성'}
                    </span>
                </td>
                <td class="px-6 py-4" data-label="관리">
                    <button onclick="regenerateBoothCode('${booth.id}')" class="text-purple-600 hover:text-purple-800 mr-3" title="코드 재발급">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button onclick="toggleBooth('${booth.id}')" class="text-blue-600 hover:text-blue-800 mr-3" title="활성화/비활성화">
                        <i class="fas fa-power-off"></i>
                    </button>
                    <button onclick="deleteBooth('${booth.id}')" class="text-red-600 hover:text-red-800" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
            tbody.appendChild(row)
        }
    } catch (error) {
        console.error('부스 목록 로드 실패:', error)
    }
}

// 참가자 목록 로드
async function loadParticipants() {
    try {
        const data = await ParticipantsAPI.getAll({ limit: 100 })
        allParticipants = data.participants

        // 부스 필터 드롭다운 채우기
        const boothSelect = document.getElementById('filterBooth')
        const uniqueBooths = [...new Set(allParticipants.map(p => p.booth_id).filter(Boolean))]
        const boothMap = {}
        
        allParticipants.forEach(p => {
            if (p.booth_id && p.booths?.name) {
                boothMap[p.booth_id] = p.booths.name
            }
        })

        boothSelect.innerHTML = '<option value="">전체</option>'
        uniqueBooths.forEach(boothId => {
            const option = document.createElement('option')
            option.value = boothId
            option.textContent = boothMap[boothId] || `부스 ${boothId}`
            boothSelect.appendChild(option)
        })

        // 테이블 렌더링 (새 함수 사용)
        renderParticipantsTable(allParticipants)

        // 카운트 업데이트
        document.getElementById('filteredCount').textContent = allParticipants.length
        document.getElementById('totalCount').textContent = allParticipants.length

    } catch (error) {
        console.error('참가자 목록 로드 실패:', error)
        const tbody = document.getElementById('participantsTableBody')
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>데이터 로드에 실패했습니다</p>
                </td>
            </tr>
        `
    }
}

// 행사 모달 열기/닫기
function openEventModal() {
    document.getElementById('eventModal').classList.add('active')
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active')
    document.getElementById('eventForm').reset()
}

// 부스 모달 열기/닫기
async function openBoothModal() {
    // 행사 목록 로드
    try {
        const data = await EventsAPI.getAll()
        const select = document.getElementById('boothEventId')
        select.innerHTML = '<option value="">행사를 선택하세요</option>'

        data.events.forEach(event => {
            const option = document.createElement('option')
            option.value = event.id
            option.textContent = event.name
            select.appendChild(option)
        })

        document.getElementById('boothModal').classList.add('active')
    } catch (error) {
        alert('행사 목록을 불러오는데 실패했습니다.')
    }
}

function closeBoothModal() {
    document.getElementById('boothModal').classList.remove('active')
    document.getElementById('boothForm').reset()
}

// 행사 생성
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const name = document.getElementById('eventName').value
    const start_date = document.getElementById('eventStartDate').value
    const end_date = document.getElementById('eventEndDate').value

    try {
        await EventsAPI.create({ name, start_date, end_date })
        alert('행사가 생성되었습니다.')
        closeEventModal()
        loadEvents()
    } catch (error) {
        alert('행사 생성에 실패했습니다: ' + error.message)
    }
})

// 부스 생성
document.getElementById('boothForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const event_id = document.getElementById('boothEventId').value
    const name = document.getElementById('boothName').value
    const description = document.getElementById('boothDescription').value

    try {
        const result = await BoothsAPI.create({ event_id, name, description })
        alert(`부스가 생성되었습니다!\\n부스 코드: ${result.booth.booth_code}`)
        closeBoothModal()
        loadBooths()
    } catch (error) {
        alert('부스 생성에 실패했습니다: ' + error.message)
    }
})

// 행사 활성화/비활성화
async function toggleEvent(id) {
    if (!confirm('행사 상태를 변경하시겠습니까?')) return

    try {
        await EventsAPI.toggle(id)
        loadEvents()
    } catch (error) {
        alert('상태 변경에 실패했습니다: ' + error.message)
    }
}

// 행사 삭제
async function deleteEvent(id) {
    if (!confirm('정말 이 행사를 삭제하시겠습니까?\\n연결된 모든 부스와 참가자 데이터도 삭제됩니다.')) return

    try {
        await EventsAPI.delete(id)
        alert('행사가 삭제되었습니다.')
        loadEvents()
    } catch (error) {
        alert('삭제에 실패했습니다: ' + error.message)
    }
}

// 부스 코드 재발급
async function regenerateBoothCode(id) {
    if (!confirm('부스 코드를 재발급하시겠습니까?')) return

    try {
        const result = await BoothsAPI.regenerateCode(id)
        alert(`새 부스 코드: ${result.booth.booth_code}`)
        loadBooths()
    } catch (error) {
        alert('코드 재발급에 실패했습니다: ' + error.message)
    }
}

// 부스 활성화/비활성화
async function toggleBooth(id) {
    if (!confirm('부스 상태를 변경하시겠습니까?')) return

    try {
        await BoothsAPI.toggle(id)
        loadBooths()
    } catch (error) {
        alert('상태 변경에 실패했습니다: ' + error.message)
    }
}

// 부스 삭제
async function deleteBooth(id) {
    if (!confirm('정말 이 부스를 삭제하시겠습니까?')) return

    try {
        await BoothsAPI.delete(id)
        alert('부스가 삭제되었습니다.')
        loadBooths()
    } catch (error) {
        alert('삭제에 실패했습니다: ' + error.message)
    }
}

// CSV 내보내기
function exportCSV() {
    // 현재 화면에 표시된 (필터링된) 참가자만 가져오기
    const displayedRows = document.querySelectorAll('#participantsTableBody tr')
    
    if (displayedRows.length === 0 || allParticipants.length === 0) {
        alert('내보낼 데이터가 없습니다.')
        return
    }

    // 필터링된 참가자 확인
    const searchName = document.getElementById('searchName').value.toLowerCase().trim()
    const filterGender = document.getElementById('filterGender').value
    const filterGrade = document.getElementById('filterGrade').value
    const filterBooth = document.getElementById('filterBooth').value

    // 필터 적용
    let participantsToExport = allParticipants
    if (searchName || filterGender || filterGrade || filterBooth) {
        participantsToExport = allParticipants.filter(p => {
            if (searchName && !p.name.toLowerCase().includes(searchName)) return false
            if (filterGender && p.gender !== filterGender) return false
            if (filterGrade && p.grade !== filterGrade) return false
            if (filterBooth && p.booth_id !== filterBooth) return false
            return true
        })
    }

    // CSV 헤더 (UTF-8 BOM 추가)
    let csv = '\uFEFF이름,성별,교급,생년월일,부스명,등록일시\n'

    // CSV 데이터
    participantsToExport.forEach(p => {
        csv += `${p.name},${p.gender},${p.grade},${p.date_of_birth},${p.booths?.name || '-'},${formatDateTime(p.created_at)}\n`
    })

    // 다운로드
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    const filename = participantsToExport.length === allParticipants.length 
        ? `participants_${new Date().toISOString().split('T')[0]}.csv`
        : `participants_filtered_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 사용자에게 알림
    alert(`${participantsToExport.length}명의 참가자 데이터를 내보냈습니다.`)
}

// 날짜 포맷
function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

// 날짜/시간 포맷
function formatDateTime(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 참가자 필터링
function filterParticipants() {
    const searchName = document.getElementById('searchName').value.toLowerCase().trim()
    const filterGender = document.getElementById('filterGender').value
    const filterGrade = document.getElementById('filterGrade').value
    const filterBooth = document.getElementById('filterBooth').value

    let filtered = allParticipants.filter(p => {
        // 이름 검색
        if (searchName && !p.name.toLowerCase().includes(searchName)) {
            return false
        }

        // 성별 필터
        if (filterGender && p.gender !== filterGender) {
            return false
        }

        // 교급 필터
        if (filterGrade && p.grade !== filterGrade) {
            return false
        }

        // 부스 필터
        if (filterBooth && p.booth_id !== filterBooth) {
            return false
        }

        return true
    })

    // 필터링된 데이터로 테이블 렌더링
    renderParticipantsTable(filtered)

    // 카운트 업데이트
    document.getElementById('filteredCount').textContent = filtered.length
    document.getElementById('totalCount').textContent = allParticipants.length
}

// 필터 초기화
function resetFilters() {
    document.getElementById('searchName').value = ''
    document.getElementById('filterGender').value = ''
    document.getElementById('filterGrade').value = ''
    document.getElementById('filterBooth').value = ''
    
    filterParticipants()
}

// 참가자 테이블 렌더링 (필터링된 데이터 사용)
function renderParticipantsTable(participants) {
    const tbody = document.getElementById('participantsTableBody')
    
    if (participants.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-3xl mb-2"></i>
                    <p>검색 결과가 없습니다</p>
                </td>
            </tr>
        `
        return
    }

    tbody.innerHTML = ''
    participants.forEach(p => {
        const row = document.createElement('tr')
        row.className = 'hover:bg-gray-50 transition'
        row.innerHTML = `
            <td class="px-6 py-4" data-label="이름">
                <div class="font-medium text-gray-900">${p.name}</div>
                <div class="text-sm text-gray-500">${p.date_of_birth}</div>
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="성별">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.gender === '남성' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                }">
                    ${p.gender}
                </span>
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="교급">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    ${p.grade}
                </span>
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="부스">
                ${p.booths?.name || '-'}
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="등록일시">
                ${formatDateTime(p.created_at)}
            </td>
        `
        tbody.appendChild(row)
    })
}

// 행사별 필터링
function filterByEvent() {
    selectedEventId = document.getElementById('eventFilter').value
    loadOverview()
    
    // 차트 모드가 활성화되어 있으면 차트 모드도 업데이트
    if (document.getElementById('chartMode').classList.contains('active')) {
        updateChartMode()
    }
}

// 풀스크린 차트 모드 진입
let chartModeInterval = null
let chartModeGenderChart = null
let chartModeGradeChart = null
let chartModeBoothChart = null
let lastDataSnapshot = null // 마지막 데이터 스냅샷

function enterChartMode() {
    document.getElementById('chartMode').classList.add('active')
    document.body.style.overflow = 'hidden'
    
    lastDataSnapshot = null // 스냅샷 초기화
    updateChartMode()
    
    // 5초마다 데이터 체크 (변경시에만 갱신)
    chartModeInterval = setInterval(() => {
        checkAndUpdateChartMode()
    }, 5000)
}

// 데이터 변경 체크 후 업데이트
async function checkAndUpdateChartMode() {
    try {
        const data = await StatsAPI.getAll()
        const currentSnapshot = JSON.stringify(data)
        
        // 데이터가 변경된 경우에만 업데이트
        if (currentSnapshot !== lastDataSnapshot) {
            console.log('📊 새로운 데이터 감지 - 차트 업데이트 중...')
            lastDataSnapshot = currentSnapshot
            updateChartMode()
        } else {
            // 시간만 업데이트
            const now = new Date()
            document.getElementById('chartModeUpdateTime').textContent = now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }
    } catch (error) {
        console.error('데이터 체크 실패:', error)
    }
}

// 풀스크린 차트 모드 종료
function exitChartMode() {
    document.getElementById('chartMode').classList.remove('active')
    document.body.style.overflow = 'auto'
    
    // 자동 갱신 중지
    if (chartModeInterval) {
        clearInterval(chartModeInterval)
        chartModeInterval = null
    }
    
    // 차트 파괴
    if (chartModeGenderChart) {
        chartModeGenderChart.destroy()
        chartModeGenderChart = null
    }
    if (chartModeGradeChart) {
        chartModeGradeChart.destroy()
        chartModeGradeChart = null
    }
    if (chartModeBoothChart) {
        chartModeBoothChart.destroy()
        chartModeBoothChart = null
    }
}

// ESC 키로 차트 모드 종료
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('chartMode').classList.contains('active')) {
        exitChartMode()
    }
})

// 차트 모드 데이터 업데이트
async function updateChartMode() {
    try {
        const data = await StatsAPI.getAll()
        
        // 현재 데이터 스냅샷 저장
        lastDataSnapshot = JSON.stringify(data)
        
        // 선택된 행사 이름 표시
        const eventFilter = document.getElementById('eventFilter')
        const selectedEventName = eventFilter.options[eventFilter.selectedIndex]?.text || '전체 행사'
        document.getElementById('chartModeEventName').textContent = selectedEventName
        
        // 선택된 행사 필터링
        let filteredEvents = data.events
        if (selectedEventId) {
            filteredEvents = data.events.filter(event => {
                const eventId = event.id || event.event_id
                return eventId === selectedEventId
            })
        }
        
        // 총 참가자 계산
        let totalParticipants = 0
        let genderDistribution = { male: 0, female: 0 }
        let gradeDistribution = { infant: 0, elementary: 0, middle: 0, high: 0, adult: 0, other: 0 }
        let totalBooths = 0
        
        filteredEvents.forEach(event => {
            totalBooths += event.booth_count || 0
            if (event.booths) {
                event.booths.forEach(booth => {
                    // total_participants 또는 participant_count 사용
                    totalParticipants += booth.total_participants || booth.participant_count || 0
                    
                    if (booth.gender_distribution) {
                        genderDistribution.male += booth.gender_distribution.male || 0
                        genderDistribution.female += booth.gender_distribution.female || 0
                    }
                    
                    if (booth.grade_distribution) {
                        gradeDistribution.infant += booth.grade_distribution.infant || 0
                        gradeDistribution.elementary += booth.grade_distribution.elementary || 0
                        gradeDistribution.middle += booth.grade_distribution.middle || 0
                        gradeDistribution.high += booth.grade_distribution.high || 0
                        gradeDistribution.adult += booth.grade_distribution.adult || 0
                        gradeDistribution.other += booth.grade_distribution.other || 0
                    }
                })
            }
        })
        
        // 요약 카드 업데이트 (NaN 방지)
        document.getElementById('chartModeTotalParticipants').textContent = isNaN(totalParticipants) ? 0 : totalParticipants
        document.getElementById('chartModeTotalEvents').textContent = filteredEvents.length
        document.getElementById('chartModeTotalBooths').textContent = totalBooths
        
        // 성별 비율 계산
        const total = genderDistribution.male + genderDistribution.female
        const malePercent = total > 0 ? Math.round((genderDistribution.male / total) * 100) : 0
        const femalePercent = total > 0 ? Math.round((genderDistribution.female / total) * 100) : 0
        document.getElementById('chartModeGenderRatio').textContent = `${malePercent}% / ${femalePercent}%`
        
        // 업데이트 시간
        const now = new Date()
        document.getElementById('chartModeUpdateTime').textContent = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
        
        // 부스별 데이터 수집
        let boothData = []
        filteredEvents.forEach(event => {
            if (event.booths) {
                event.booths.forEach(booth => {
                    boothData.push({
                        name: booth.name || booth.booth_name,
                        count: booth.total_participants || booth.participant_count || 0
                    })
                })
            }
        })
        // 참가자 수 많은 순으로 정렬
        boothData.sort((a, b) => b.count - a.count)
        // 상위 10개만 표시
        boothData = boothData.slice(0, 10)
        
        console.log('📊 [차트 모드] 총 참가자:', totalParticipants)
        console.log('📊 [차트 모드] 부스별 데이터:', boothData)
        
        // 차트 업데이트
        updateChartModeGenderChart(genderDistribution)
        updateChartModeGradeChart(gradeDistribution)
        updateChartModeBoothChart(boothData)
    } catch (error) {
        console.error('차트 모드 데이터 업데이트 실패:', error)
    }
}

// 차트 모드 성별 차트
function updateChartModeGenderChart(data) {
    const ctx = document.getElementById('chartModeGenderChart').getContext('2d')
    
    if (chartModeGenderChart) {
        chartModeGenderChart.destroy()
    }
    
    const labels = Object.keys(data)
    const values = Object.values(data)
    
    chartModeGenderChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(236, 72, 153, 1)'
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
                        font: { size: 18, weight: 'bold' },
                        padding: 20,
                        generateLabels: function(chart) {
                            const data = chart.data
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i]
                                return {
                                    text: `${label}: ${value}명`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }
                            })
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { size: 24, weight: 'bold' },
                    formatter: function(value) {
                        return value + '명'
                    }
                }
            }
        }
    })
    
    // 통계 테이블 업데이트
    updateChartModeGenderStatsTable(data)
}

// 차트 모드 성별 통계 테이블
function updateChartModeGenderStatsTable(data) {
    const tableContainer = document.getElementById('chartModeGenderStatsTable')
    tableContainer.innerHTML = ''
    
    Object.entries(data).forEach(([gender, count]) => {
        const statItem = document.createElement('div')
        statItem.className = 'p-3 rounded-lg bg-gray-50'
        statItem.innerHTML = `
            <div class="text-base text-gray-600 mb-1">${gender}</div>
            <div class="text-2xl font-bold text-gray-800">${count}<span class="text-sm text-gray-500 ml-1">명</span></div>
        `
        tableContainer.appendChild(statItem)
    })
}

// 차트 모드 교급 차트
function updateChartModeGradeChart(data) {
    const ctx = document.getElementById('chartModeGradeChart').getContext('2d')
    
    if (chartModeGradeChart) {
        chartModeGradeChart.destroy()
    }
    
    const allGrades = ['유아', '초등', '중등', '고등', '성인']
    const labels = allGrades
    const values = allGrades.map(grade => data[grade] || 0)
    
    chartModeGradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '참가자 수',
                data: values,
                backgroundColor: [
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(99, 102, 241, 0.8)'
                ],
                borderColor: [
                    'rgba(251, 191, 36, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(99, 102, 241, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 14 },
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: { display: false }
                }
            }
        }
    })
    
    // 통계 테이블 업데이트
    updateChartModeGradeStatsTable(data)
}

// 차트 모드 교급 통계 테이블
function updateChartModeGradeStatsTable(data) {
    const tableContainer = document.getElementById('chartModeGradeStatsTable')
    tableContainer.innerHTML = ''
    
    const allGrades = ['유아', '초등', '중등', '고등', '성인']
    
    allGrades.forEach(grade => {
        const count = data[grade] || 0
        const statItem = document.createElement('div')
        statItem.className = 'p-2 rounded-lg bg-gray-50'
        statItem.innerHTML = `
            <div class="text-xs text-gray-600">${grade}</div>
            <div class="text-lg font-bold text-gray-800">${count}<span class="text-xs text-gray-500 ml-1">명</span></div>
        `
        tableContainer.appendChild(statItem)
    })
}

// 차트 모드 부스 차트
function updateChartModeBoothChart(boothData) {
    const ctx = document.getElementById('chartModeBoothChart')
    if (!ctx) return
    
    if (chartModeBoothChart) {
        chartModeBoothChart.destroy()
    }
    
    // 데이터가 없을 때 처리
    if (!boothData || boothData.length === 0) {
        boothData = [{ name: '데이터 없음', count: 0 }]
    }
    
    chartModeBoothChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: boothData.map(booth => booth.name),
            datasets: [{
                label: '참가자 수',
                data: boothData.map(booth => booth.count),
                backgroundColor: [
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)'
                ],
                borderColor: [
                    'rgb(236, 72, 153)',
                    'rgb(168, 85, 247)',
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(34, 197, 94)',
                    'rgb(249, 115, 22)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 15
                    },
                    callbacks: {
                        label: function(context) {
                            return '참가자: ' + context.parsed.x + '명'
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        font: { size: 14 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    ticks: {
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    })
}

// 초기 로드
loadOverview()

// 페이지가 보일 때마다 자동 새로고침
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 현재 활성화된 탭에 따라 새로고침
        const activeTab = document.querySelector('.tab-content.active')
        if (activeTab && activeTab.id === 'tab-overview') {
            console.log('📊 페이지 포커스 - 통계 데이터 새로고침')
            loadOverview()
        }
    }
})

// 창이 포커스를 받을 때마다 새로고침
window.addEventListener('focus', () => {
    const activeTab = document.querySelector('.tab-content.active')
    if (activeTab && activeTab.id === 'tab-overview') {
        console.log('📊 창 포커스 - 통계 데이터 새로고침')
        loadOverview()
    }
})
