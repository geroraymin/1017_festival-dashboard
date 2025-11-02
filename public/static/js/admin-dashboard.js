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
            const eventName = event.name || event.event_name
            if (event.booths) {
                event.booths.forEach(booth => {
                    const boothName = booth.name || booth.booth_name
                    // 전체 행사 선택 시: 행사명 포함, 특정 행사 선택 시: 부스명만
                    const displayName = selectedEventId ? boothName : `${eventName}-${boothName}`
                    boothData.push({
                        name: displayName,
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
    
    // 리더보드 업데이트
    if (selectedEventId) {
        loadLeaderboard(selectedEventId)
    } else {
        // 전체 행사 선택 시 리더보드 숨김
        document.getElementById('leaderboardSection').style.display = 'none'
    }
    
    // 차트 모드가 활성화되어 있으면 차트 모드도 업데이트
    if (document.getElementById('chartMode').classList.contains('active')) {
        updateChartMode()
    }
}

// 풀스크린 모드 전역 변수
let chartModeInterval = null
let chartModeGenderChart = null
let chartModeGradeChart = null
let chartModeBoothChart = null
let cardModeInterval = null
let lastDataSnapshot = null // 마지막 데이터 스냅샷

// 행사별 색상 테마
const eventColors = [
    { bg: 'bg-blue-500', text: 'text-blue-600', gradient: 'from-blue-400 to-blue-600' },
    { bg: 'bg-purple-500', text: 'text-purple-600', gradient: 'from-purple-400 to-purple-600' },
    { bg: 'bg-pink-500', text: 'text-pink-600', gradient: 'from-pink-400 to-pink-600' },
    { bg: 'bg-green-500', text: 'text-green-600', gradient: 'from-green-400 to-green-600' },
    { bg: 'bg-orange-500', text: 'text-orange-600', gradient: 'from-orange-400 to-orange-600' },
    { bg: 'bg-teal-500', text: 'text-teal-600', gradient: 'from-teal-400 to-teal-600' },
    { bg: 'bg-indigo-500', text: 'text-indigo-600', gradient: 'from-indigo-400 to-indigo-600' },
    { bg: 'bg-rose-500', text: 'text-rose-600', gradient: 'from-rose-400 to-rose-600' }
]

// 행사별 아이콘
const eventIcons = ['fa-calendar-star', 'fa-flag-checkered', 'fa-trophy', 'fa-rocket', 'fa-star', 'fa-heart', 'fa-gift', 'fa-crown']

// 부스별 아이콘 (랜덤)
const boothIcons = ['fa-store', 'fa-shop', 'fa-cart-shopping', 'fa-bag-shopping', 'fa-basket-shopping', 'fa-gifts']

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

// ESC 키로 모드 종료
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('chartMode').classList.contains('active')) {
            exitChartMode()
        } else if (document.getElementById('cardMode').classList.contains('active')) {
            exitCardMode()
        }
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
        let genderDistribution = { '남성': 0, '여성': 0 }
        let gradeDistribution = { '유아': 0, '초등': 0, '중등': 0, '고등': 0, '성인': 0 }
        let totalBooths = 0
        
        filteredEvents.forEach(event => {
            totalBooths += event.booth_count || 0
            if (event.booths) {
                event.booths.forEach(booth => {
                    // total_participants 또는 participant_count 사용
                    totalParticipants += booth.total_participants || booth.participant_count || 0
                    
                    if (booth.gender_distribution) {
                        genderDistribution['남성'] += booth.gender_distribution['남성'] || 0
                        genderDistribution['여성'] += booth.gender_distribution['여성'] || 0
                    }
                    
                    if (booth.grade_distribution) {
                        gradeDistribution['유아'] += booth.grade_distribution['유아'] || 0
                        gradeDistribution['초등'] += booth.grade_distribution['초등'] || 0
                        gradeDistribution['중등'] += booth.grade_distribution['중등'] || 0
                        gradeDistribution['고등'] += booth.grade_distribution['고등'] || 0
                        gradeDistribution['성인'] += booth.grade_distribution['성인'] || 0
                    }
                })
            }
        })
        
        // 요약 카드 업데이트 (NaN 방지)
        document.getElementById('chartModeTotalParticipants').textContent = isNaN(totalParticipants) ? 0 : totalParticipants
        document.getElementById('chartModeTotalEvents').textContent = filteredEvents.length
        document.getElementById('chartModeTotalBooths').textContent = totalBooths
        
        // 성별 비율 계산
        const total = genderDistribution['남성'] + genderDistribution['여성']
        const malePercent = total > 0 ? Math.round((genderDistribution['남성'] / total) * 100) : 0
        const femalePercent = total > 0 ? Math.round((genderDistribution['여성'] / total) * 100) : 0
        document.getElementById('chartModeGenderRatio').textContent = `${malePercent}% / ${femalePercent}%`
        
        // 업데이트 시간
        const now = new Date()
        document.getElementById('chartModeUpdateTime').textContent = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
        
        // 부스별 데이터 수집 (차트 모드용)
        let boothData = []
        filteredEvents.forEach(event => {
            const eventName = event.name || event.event_name
            if (event.booths) {
                event.booths.forEach(booth => {
                    const boothName = booth.name || booth.booth_name
                    // 전체 행사 선택 시: 행사명 포함, 특정 행사 선택 시: 부스명만
                    const displayName = selectedEventId ? boothName : `${eventName}-${boothName}`
                    boothData.push({
                        name: displayName,
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
                        font: { size: 12, weight: 'bold' },
                        padding: 10,
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
                    font: { size: 16, weight: 'bold' },
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
        statItem.className = 'p-2 rounded-lg bg-gray-50'
        statItem.innerHTML = `
            <div class="text-xs text-gray-600">${gender}</div>
            <div class="text-lg font-bold text-gray-800">${count}<span class="text-xs text-gray-500 ml-1">명</span></div>
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
                        font: { size: 10 },
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10, weight: 'bold' }
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

// ============================================
// 카드 모드 함수들
// ============================================

// 카드 모드 진입
function enterCardMode() {
    document.getElementById('cardMode').classList.add('active')
    document.body.style.overflow = 'hidden'
    
    lastDataSnapshot = null
    updateCardMode()
    
    // 10초마다 자동 갱신
    cardModeInterval = setInterval(() => {
        updateCardMode()
    }, 10000)
}

// 카드 모드 종료
function exitCardMode() {
    document.getElementById('cardMode').classList.remove('active')
    document.body.style.overflow = 'auto'
    
    if (cardModeInterval) {
        clearInterval(cardModeInterval)
        cardModeInterval = null
    }
}

// 카드 모드 데이터 업데이트
async function updateCardMode() {
    try {
        const data = await StatsAPI.getAll()
        
        // 선택된 행사 이름 표시
        const eventFilter = document.getElementById('eventFilter')
        const selectedEventName = eventFilter.options[eventFilter.selectedIndex]?.text || '전체 행사'
        document.getElementById('cardModeEventName').textContent = selectedEventName
        
        // 선택된 행사 필터링
        let filteredEvents = data.events
        if (selectedEventId) {
            filteredEvents = data.events.filter(event => {
                const eventId = event.id || event.event_id
                return eventId === selectedEventId
            })
        }
        
        // 총 통계 계산
        let totalParticipants = 0
        let totalBooths = 0
        
        filteredEvents.forEach(event => {
            totalBooths += event.booth_count || 0
            if (event.booths) {
                event.booths.forEach(booth => {
                    totalParticipants += booth.total_participants || booth.participant_count || 0
                })
            }
        })
        
        // 요약 카드 업데이트
        document.getElementById('cardModeTotalParticipants').textContent = totalParticipants
        document.getElementById('cardModeTotalEvents').textContent = filteredEvents.length
        document.getElementById('cardModeTotalBooths').textContent = totalBooths
        
        // 업데이트 시간
        const now = new Date()
        document.getElementById('cardModeUpdateTime').textContent = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
        
        // 카드 렌더링
        if (selectedEventId) {
            // 특정 행사 선택 → 부스별 카드
            renderBoothCards(filteredEvents[0])
        } else {
            // 전체 행사 → 행사별 카드
            renderEventCards(filteredEvents)
        }
        
    } catch (error) {
        console.error('카드 모드 데이터 업데이트 실패:', error)
    }
}

// 행사별 카드 렌더링
function renderEventCards(events) {
    const container = document.getElementById('cardModeGrid')
    const sortOrder = document.getElementById('cardModeSortOrder').value
    
    document.getElementById('cardModeDescription').textContent = '행사 카드를 클릭하면 해당 행사의 부스를 확인할 수 있습니다'
    
    // 정렬
    const sortedEvents = [...events].sort((a, b) => {
        if (sortOrder === 'count') {
            // 참가자 많은 순
            const aCount = a.booths?.reduce((sum, booth) => sum + (booth.total_participants || 0), 0) || 0
            const bCount = b.booths?.reduce((sum, booth) => sum + (booth.total_participants || 0), 0) || 0
            return bCount - aCount
        } else {
            // 일자 순 (시작일 기준)
            const aDate = new Date(a.start_date || 0)
            const bDate = new Date(b.start_date || 0)
            return bDate - aDate
        }
    })
    
    // 카드 생성
    container.innerHTML = sortedEvents.map((event, index) => {
        const eventId = event.id || event.event_id
        const eventName = event.name || event.event_name
        const boothCount = event.booth_count || 0
        const participantCount = event.booths?.reduce((sum, booth) => sum + (booth.total_participants || 0), 0) || 0
        const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''
        const endDate = event.end_date ? new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''
        
        const color = eventColors[index % eventColors.length]
        const icon = eventIcons[index % eventIcons.length]
        
        return `
            <div onclick="selectEventFromCard('${eventId}')" 
                class="bg-gradient-to-br ${color.gradient} rounded-xl shadow-2xl p-6 cursor-pointer transform transition hover:scale-105 hover:shadow-3xl">
                <div class="text-white">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas ${icon} text-4xl opacity-80"></i>
                        <span class="text-sm opacity-80">${startDate}${endDate ? ' - ' + endDate : ''}</span>
                    </div>
                    <h3 class="text-xl font-bold mb-2 line-clamp-2">${eventName}</h3>
                    <div class="mt-4 pt-4 border-t border-white border-opacity-30">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-3xl font-bold">${participantCount}</div>
                                <div class="text-sm opacity-80">참가자</div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold">${boothCount}</div>
                                <div class="text-sm opacity-80">부스</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }).join('')
}

// 부스별 카드 렌더링
function renderBoothCards(event) {
    const container = document.getElementById('cardModeGrid')
    const sortOrder = document.getElementById('cardModeSortOrder').value
    
    if (!event || !event.booths) {
        container.innerHTML = '<div class="col-span-full text-center text-white text-lg">부스 데이터가 없습니다</div>'
        return
    }
    
    document.getElementById('cardModeDescription').textContent = `${event.name || event.event_name} 행사의 부스별 실적입니다`
    
    // 정렬 (부스는 참가자 많은 순 또는 이름 순)
    const sortedBooths = [...event.booths].sort((a, b) => {
        if (sortOrder === 'count') {
            const aCount = a.total_participants || a.participant_count || 0
            const bCount = b.total_participants || b.participant_count || 0
            return bCount - aCount
        } else {
            // 이름 순
            const aName = a.name || a.booth_name || ''
            const bName = b.name || b.booth_name || ''
            return aName.localeCompare(bName)
        }
    })
    
    // 행사 색상 (첫 번째 행사와 동일한 색상 사용)
    const eventIndex = allEvents.findIndex(e => (e.id || e.event_id) === selectedEventId)
    const color = eventColors[eventIndex >= 0 ? eventIndex % eventColors.length : 0]
    
    // 카드 생성
    container.innerHTML = sortedBooths.map((booth, index) => {
        const boothName = booth.name || booth.booth_name
        const participantCount = booth.total_participants || booth.participant_count || 0
        const icon = boothIcons[index % boothIcons.length]
        
        // 성별 분포
        const genderDist = booth.gender_distribution || {}
        const maleCount = genderDist['남성'] || 0
        const femaleCount = genderDist['여성'] || 0
        const totalGender = maleCount + femaleCount
        const genderRatio = totalGender > 0 ? `${Math.round(maleCount/totalGender*100)}% / ${Math.round(femaleCount/totalGender*100)}%` : '-'
        
        // 최다 교급
        const gradeDist = booth.grade_distribution || {}
        const gradeEntries = Object.entries(gradeDist)
        const topGrade = gradeEntries.length > 0 
            ? gradeEntries.reduce((max, curr) => curr[1] > max[1] ? curr : max, gradeEntries[0])[0]
            : '-'
        
        return `
            <div class="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-${color.bg.replace('bg-', '')} transform transition hover:scale-105 hover:shadow-3xl">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas ${icon} text-3xl ${color.text}"></i>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-gray-800">${participantCount}</div>
                        <div class="text-xs text-gray-500">명</div>
                    </div>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-3 line-clamp-2">${boothName}</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center justify-between text-gray-600">
                        <span><i class="fas fa-venus-mars mr-1"></i>성별</span>
                        <span class="font-semibold">${genderRatio}</span>
                    </div>
                    <div class="flex items-center justify-between text-gray-600">
                        <span><i class="fas fa-graduation-cap mr-1"></i>최다 교급</span>
                        <span class="font-semibold">${topGrade}</span>
                    </div>
                </div>
            </div>
        `
    }).join('')
}

// 행사 카드 클릭 시 해당 행사 선택
function selectEventFromCard(eventId) {
    const eventFilter = document.getElementById('eventFilter')
    eventFilter.value = eventId
    selectedEventId = eventId
    
    // 카드 모드 업데이트
    updateCardMode()
}

// 부스 리더보드 로드
async function loadLeaderboard(eventId) {
    const section = document.getElementById('leaderboardSection')
    const loading = document.getElementById('leaderboardLoading')
    const list = document.getElementById('leaderboardList')
    const empty = document.getElementById('leaderboardEmpty')
    const eventName = document.getElementById('leaderboardEventName')
    
    // 섹션 표시
    section.style.display = 'block'
    loading.style.display = 'block'
    list.style.display = 'none'
    empty.style.display = 'none'
    
    try {
        const response = await fetch(`/api/stats/leaderboard/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        
        if (!response.ok) throw new Error('리더보드를 불러오는데 실패했습니다')
        
        const data = await response.json()
        
        // 행사명 표시
        eventName.textContent = data.event_name
        
        if (data.leaderboard && data.leaderboard.length > 0) {
            renderLeaderboard(data.leaderboard, data.max_participants)
            loading.style.display = 'none'
            list.style.display = 'block'
        } else {
            loading.style.display = 'none'
            empty.style.display = 'block'
        }
    } catch (error) {
        console.error('Leaderboard error:', error)
        loading.style.display = 'none'
        empty.style.display = 'block'
        empty.innerHTML = `
            <i class="fas fa-exclamation-triangle text-4xl mb-2 text-red-500"></i>
            <p>${error.message}</p>
        `
    }
}

// 리더보드 렌더링
function renderLeaderboard(booths, maxCount) {
    const list = document.getElementById('leaderboardList')
    
    list.innerHTML = booths.map((booth, index) => {
        const percentage = maxCount > 0 ? (booth.participant_count / maxCount * 100) : 0
        const isTop3 = index < 3
        
        // 순위별 메달/색상
        let rankBadge, rankColor
        if (booth.rank === 1) {
            rankBadge = '<i class="fas fa-trophy text-yellow-500"></i>'
            rankColor = 'border-yellow-500'
        } else if (booth.rank === 2) {
            rankBadge = '<i class="fas fa-medal text-gray-400"></i>'
            rankColor = 'border-gray-400'
        } else if (booth.rank === 3) {
            rankBadge = '<i class="fas fa-medal text-orange-600"></i>'
            rankColor = 'border-orange-600'
        } else {
            rankBadge = `<span class="text-gray-600 font-bold">${booth.rank}</span>`
            rankColor = 'border-gray-300'
        }
        
        return `
            <div class="bg-white rounded-lg p-4 mb-3 shadow-md border-l-4 ${rankColor} hover:shadow-lg transition">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 flex items-center justify-center text-2xl">
                            ${rankBadge}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${booth.booth_name}</h4>
                            <p class="text-xs text-gray-500">코드: ${booth.booth_code}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-indigo-600">${booth.participant_count}</div>
                        <div class="text-xs text-gray-500">참가자</div>
                    </div>
                </div>
                
                <!-- 진행률 바 -->
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" 
                         style="width: ${percentage}%"></div>
                </div>
                <div class="text-right text-xs text-gray-500 mt-1">${percentage.toFixed(1)}%</div>
                
                ${!booth.is_active ? '<div class="mt-2 text-xs text-red-600"><i class="fas fa-ban mr-1"></i>비활성</div>' : ''}
            </div>
        `
    }).join('')
}
