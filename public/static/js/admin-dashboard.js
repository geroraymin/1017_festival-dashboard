/**
 * 관리자 대시보드 JavaScript
 */

let overallGenderChart, overallGradeChart, overallBoothChart
let allEvents = []
let allBooths = []
let allParticipants = []
let selectedEventId = '' // 선택된 행사 ID (빈 문자열 = 전체)
let selectedCountDate = '' // 일자별 집계 기준일 (빈 문자열 = 전체 기간)

function getEventId(event) {
    return String(event?.id || event?.event_id || '')
}

function getEventName(event) {
    return event?.name || event?.event_name || ''
}

function getEventFilterElements() {
    return ['eventFilter', 'boothEventFilter', 'participantEventFilter']
        .map(id => document.getElementById(id))
        .filter(Boolean)
}

function populateEventFilters(events = allEvents) {
    getEventFilterElements().forEach(select => {
        const currentValue = select.value || selectedEventId || ''
        select.innerHTML = '<option value="">전체 행사</option>'

        events.forEach(event => {
            const eventId = getEventId(event)
            if (!eventId) return

            const option = document.createElement('option')
            option.value = eventId
            option.textContent = getEventName(event) || eventId
            select.appendChild(option)
        })

        select.value = [...select.options].some(option => option.value === currentValue) ? currentValue : ''
    })
}

function syncEventFilters() {
    getEventFilterElements().forEach(select => {
        select.value = selectedEventId || ''
    })
}

function syncCountDateFilters() {
    ['countDateFilter', 'participantDateFilter']
        .map(id => document.getElementById(id))
        .filter(Boolean)
        .forEach(input => {
            input.value = selectedCountDate || ''
        })
}

async function ensureEventFiltersLoaded(events = null) {
    if (events) {
        allEvents = events
        populateEventFilters(allEvents)
        syncEventFilters()
        return
    }

    if (allEvents.length === 0) {
        const data = await EventsAPI.getAll()
        allEvents = data.events || []
    }

    populateEventFilters(allEvents)
    syncEventFilters()
}

function getActiveTabName() {
    const activeTab = document.querySelector('.tab-content.active')
    return activeTab ? activeTab.id.replace('tab-', '') : 'overview'
}

function buildOverviewFromParticipants(participants) {
    const genderDistribution = { '남성': 0, '여성': 0 }
    const gradeDistribution = { '유아': 0, '초등': 0, '중등': 0, '고등': 0, '성인': 0 }
    const boothMap = new Map()
    const eventIds = new Set()
    const boothIds = new Set()

    participants.forEach(participant => {
        if (participant.event_id) eventIds.add(String(participant.event_id))
        if (participant.booth_id) boothIds.add(String(participant.booth_id))

        if (genderDistribution[participant.gender] !== undefined) {
            genderDistribution[participant.gender] += 1
        }

        if (gradeDistribution[participant.grade] !== undefined) {
            gradeDistribution[participant.grade] += 1
        }

        const boothKey = participant.booth_id || participant.booth_name || 'unknown'
        const boothName = participant.booth_name || '-'
        const eventName = participant.event_name || ''
        const displayName = selectedEventId || !eventName ? boothName : `${eventName}-${boothName}`
        const current = boothMap.get(boothKey) || { name: displayName, count: 0 }
        current.count += 1
        boothMap.set(boothKey, current)
    })

    return {
        totalParticipants: participants.length,
        uniqueParticipants: new Set(participants.map(participant => [
            participant.name,
            participant.gender,
            participant.grade,
            participant.date_of_birth
        ].join('|'))).size,
        totalEvents: eventIds.size,
        totalBooths: boothIds.size,
        genderDistribution,
        gradeDistribution,
        boothData: [...boothMap.values()].sort((a, b) => b.count - a.count).slice(0, 10)
    }
}

function setOverviewCounts(summary) {
    document.getElementById('totalParticipants').textContent = summary.totalParticipants || 0
    document.getElementById('uniqueParticipants').textContent = summary.uniqueParticipants || 0
    document.getElementById('totalEvents').textContent = summary.totalEvents || 0
    document.getElementById('totalBooths').textContent = summary.totalBooths || 0
}

function setLastUpdateTime() {
    const now = new Date()
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

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

    syncEventFilters()
    syncCountDateFilters()
}

// 통계 개요 로드
async function loadOverview() {
    try {
        const data = await StatsAPI.getAll()

        await ensureEventFiltersLoaded(data.events)

        // 선택된 행사 필터링
        let filteredEvents = data.events
        if (selectedEventId) {
            filteredEvents = data.events.filter(event => {
                const eventId = String(event.id || event.event_id)
                return eventId === String(selectedEventId)
            })
        }

        if (selectedCountDate) {
            const params = { limit: 100000, date: selectedCountDate }
            if (selectedEventId) {
                params.event_id = selectedEventId
            }

            const participantsData = await ParticipantsAPI.getAll(params)
            const dailySummary = buildOverviewFromParticipants(participantsData.participants || [])

            setOverviewCounts(dailySummary)
            setLastUpdateTime()
            updateOverallGenderChart(dailySummary.genderDistribution)
            updateOverallGradeChart(dailySummary.gradeDistribution)
            updateOverallBoothChart(dailySummary.boothData)
            return
        }

        // 총 참가자 계산 (필터링된 행사 기준)
        let totalParticipants = 0  // 연인원
        let uniqueParticipants = 0  // 실인원

        if (!selectedEventId && data.unique_participants !== undefined) {
            uniqueParticipants = data.unique_participants || 0
        }

        filteredEvents.forEach((event, eventIndex) => {
            
            if (event.booths) {
                event.booths.forEach((booth, boothIndex) => {
                    // 연인원 (total_participants)
                    const count = booth.total_participants || booth.participant_count || 0
                    totalParticipants += count
                })
            }

            if (selectedEventId) {
                uniqueParticipants += event.unique_participants || 0
            }
        })
        
        
        // Fallback: NaN이면 0으로 표시
        const displayTotal = isNaN(totalParticipants) ? 0 : totalParticipants
        const displayUnique = isNaN(uniqueParticipants) ? 0 : uniqueParticipants
        
        setOverviewCounts({
            totalParticipants: displayTotal,
            uniqueParticipants: displayUnique,
            totalEvents: filteredEvents.length,
            totalBooths: 0
        })

        // 행사 및 부스 수 (필터링된 기준)
        let totalBooths = 0
        filteredEvents.forEach(event => {
            totalBooths += event.booth_count
        })
        document.getElementById('totalBooths').textContent = totalBooths

        // 마지막 업데이트 시간
        setLastUpdateTime()

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
    // 리더보드 섹션 표시
    const section = document.getElementById('leaderboardSection')
    const loadingContainer = document.getElementById('leaderboardLoading')
    const listContainer = document.getElementById('leaderboardList')
    const emptyContainer = document.getElementById('leaderboardEmpty')
    
    if (!section || !listContainer) return
    
    // 섹션 항상 표시
    section.style.display = 'block'
    
    // 로딩 숨기기
    if (loadingContainer) {
        loadingContainer.style.display = 'none'
    }
    
    // 데이터가 없을 때 처리
    if (!boothData || boothData.length === 0) {
        listContainer.style.display = 'none'
        emptyContainer.style.display = 'block'
        return
    }
    
    // 데이터를 참가자 수로 정렬
    boothData.sort((a, b) => b.count - a.count)
    
    // 카드 HTML 생성
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">'
    
    boothData.forEach((booth, index) => {
        const rank = index + 1
        
        html += `
            <div class="booth-card" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1.25rem; cursor: pointer; transition: all 0.2s ease;"
                 onmouseover="this.style.boxShadow='0 4px 12px rgba(16, 24, 40, 0.08)'"
                 onmouseout="this.style.boxShadow='none'">
                
                <!-- 순위 표시 -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 2.25rem; height: 2.25rem; padding: 0 0.625rem; background: #F3F4F6; border-radius: 999px; color: #374151; font-weight: 800; font-size: 0.9375rem;">#${rank}</div>
                    <div style="font-size: 0.875rem; color: #6E6E73; font-weight: 600;">${booth.booth_code || ''}</div>
                </div>
                
                <!-- 부스명 -->
                <h4 style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${booth.name}
                </h4>
                
                <!-- 참가자 수 -->
                <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <span style="font-size: 2.25rem; font-weight: 900; color: #111827; letter-spacing: 0;">${booth.count}</span>
                    <span style="font-size: 1rem; color: #6E6E73; font-weight: 600;">명</span>
                </div>
                
                <!-- 행사명 태그 -->
                ${booth.event_name ? `
                <div style="display: inline-block; padding: 0.25rem 0.75rem; background: #F3F4F6; border-radius: 999px; font-size: 0.75rem; color: #4B5563; font-weight: 600;">
                    <i class="fas fa-calendar" style="margin-right: 0.25rem;"></i>${booth.event_name}
                </div>
                ` : ''}
            </div>
        `
    })
    
    html += '</div>'
    
    // DOM 업데이트
    listContainer.innerHTML = html
    listContainer.style.display = 'block'
    emptyContainer.style.display = 'none'
    
    // 더미 차트 객체 (호환성 유지)
    overallBoothChart = {
        destroy: () => {} // 빈 destroy 메서드
    }
}

// 행사 목록 로드
async function loadEvents() {
    try {
        const data = await EventsAPI.getAll()
        allEvents = data.events
        populateEventFilters(allEvents)
        syncEventFilters()

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
        await ensureEventFiltersLoaded()
        const data = await BoothsAPI.getAll(selectedEventId || undefined)
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
        await ensureEventFiltersLoaded()
        const params = { limit: 100000 }
        if (selectedEventId) {
            params.event_id = selectedEventId
        }
        if (selectedCountDate) {
            params.date = selectedCountDate
        }

        const data = await ParticipantsAPI.getAll(params)
        allParticipants = data.participants

        // 부스 필터 드롭다운 채우기
        const boothSelect = document.getElementById('filterBooth')
        const previousBooth = boothSelect.value
        const uniqueBooths = [...new Set(allParticipants.map(p => p.booth_id).filter(Boolean))]
        const boothMap = {}
        
        allParticipants.forEach(p => {
            if (p.booth_id && p.booth_name) {
                boothMap[p.booth_id] = p.booth_name
            }
        })

        boothSelect.innerHTML = '<option value="">전체</option>'
        uniqueBooths.forEach(boothId => {
            const option = document.createElement('option')
            option.value = boothId
            option.textContent = boothMap[boothId] || `부스 ${boothId}`
            boothSelect.appendChild(option)
        })
        boothSelect.value = uniqueBooths.includes(previousBooth) ? previousBooth : ''

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
    document.getElementById('eventModal').style.display = 'flex'
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none'
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

        document.getElementById('boothModal').style.display = 'flex'
    } catch (error) {
        alert('행사 목록을 불러오는데 실패했습니다.')
    }
}

function closeBoothModal() {
    document.getElementById('boothModal').style.display = 'none'
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

    // 필터링된 참가자 확인 (null-safe)
    const searchNameEl = document.getElementById('searchName')
    const filterGenderEl = document.getElementById('filterGender')
    const filterGradeEl = document.getElementById('filterGrade')
    const filterBoothEl = document.getElementById('filterBooth')
    
    const searchName = searchNameEl ? searchNameEl.value.toLowerCase().trim() : ''
    const filterGender = filterGenderEl ? filterGenderEl.value : ''
    const filterGrade = filterGradeEl ? filterGradeEl.value : ''
    const filterBooth = filterBoothEl ? filterBoothEl.value : ''

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

    // CSV 헤더 (UTF-8 BOM 추가 + 중복방문 컬럼)
    let csv = '\uFEFF이름,성별,교급,생년월일,부스명,등록일시,방문형태,참석확인\n'

    // CSV 데이터
    participantsToExport.forEach(p => {
        const visitType = p.visit_label || (p.is_duplicate === 1 ? '재방문' : '첫방문')
        const attended = Number(p.attended || 0) === 1 ? '참석' : '미확인'
        csv += `${p.name},${p.gender},${p.grade},${p.date_of_birth},${p.booth_name || '-'},${formatDateTime(p.created_at_kst || p.created_at)},${visitType},${attended}\n`
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

// exportCSV를 전역으로 노출 (HTML onclick에서 사용)
window.exportCSV = exportCSV

// 데이터 백업
async function exportDataBackup() {
    try {
        // 백업 버튼 비활성화
        const backupBtn = event.target
        const originalHTML = backupBtn.innerHTML
        backupBtn.disabled = true
        backupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 백업 중...'
        
        console.log('[백업] 백업 요청 시작...')
        
        // 인증 토큰 확인
        const token = getToken()
        if (!token) {
            throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
        }
        console.log('[백업] 토큰 확인 완료')
        
        // 백업 데이터 가져오기
        console.log('[백업] API 호출 중...')
        const backupData = await BackupAPI.exportBackup()
        console.log('[백업] API 응답 받음:', backupData)
        
        // 데이터 검증
        if (!backupData || !backupData.data) {
            throw new Error('백업 데이터 형식이 올바르지 않습니다.')
        }
        
        // JSON을 예쁘게 포맷
        const jsonStr = JSON.stringify(backupData, null, 2)
        console.log('[백업] JSON 생성 완료, 크기:', jsonStr.length, 'bytes')
        
        // Blob 생성 및 다운로드
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        
        // 파일명: backup_YYYY-MM-DD_HH-mm-ss.json
        const now = new Date()
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const filename = `guestbook_backup_${timestamp}.json`
        
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        console.log('[백업] 파일 다운로드 시작:', filename)
        
        // 성공 메시지
        alert(`백업이 완료되었습니다! ✅\n\n파일명: ${filename}\n\n총 참가자: ${backupData.statistics.total_participants}명\n실인원: ${backupData.statistics.unique_participants}명\n행사: ${backupData.statistics.total_events}개\n부스: ${backupData.statistics.total_booths}개`)
        
        // 버튼 활성화
        backupBtn.disabled = false
        backupBtn.innerHTML = originalHTML
    } catch (error) {
        console.error('[백업] 에러 발생:', error)
        
        // 에러 타입에 따른 메시지
        let errorMessage = '백업에 실패했습니다.\n\n'
        
        if (error.message.includes('로그인')) {
            errorMessage += '로그인 세션이 만료되었습니다.\n다시 로그인해주세요.'
        } else if (error.message.includes('인증')) {
            errorMessage += '인증에 실패했습니다.\n페이지를 새로고침하고 다시 시도해주세요.'
        } else if (error.message.includes('권한')) {
            errorMessage += '관리자 권한이 필요합니다.'
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
            errorMessage += '네트워크 연결을 확인해주세요.'
        } else {
            errorMessage += '오류: ' + error.message
        }
        
        // 추가 디버그 정보가 있으면 콘솔에 출력
        console.error('[백업] 전체 에러 객체:', error)
        
        alert(errorMessage)
        
        // 버튼 활성화
        if (event && event.target) {
            event.target.disabled = false
            event.target.innerHTML = '<i class="fas fa-database"></i> 백업'
        }
    }
}

window.exportDataBackup = exportDataBackup

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
// 전역 필터 변수
let currentGenderFilter = ''
let currentGradeFilter = ''

// 성별 필터 설정
function setGenderFilter(value) {
    currentGenderFilter = value
    
    // 모든 성별 버튼 비활성화
    document.querySelectorAll('.filter-btn-gender').forEach(btn => {
        btn.classList.remove('active')
    })
    
    // 선택된 버튼 활성화
    const selectedBtn = document.querySelector(`.filter-btn-gender[data-value="${value}"]`)
    if (selectedBtn) {
        selectedBtn.classList.add('active')
    }
    
    filterParticipants()
}

// 교급 필터 설정
function setGradeFilter(value) {
    currentGradeFilter = value
    
    // 모든 교급 버튼 비활성화
    document.querySelectorAll('.filter-btn-grade').forEach(btn => {
        btn.classList.remove('active')
    })
    
    // 선택된 버튼 활성화
    const selectedBtn = document.querySelector(`.filter-btn-grade[data-value="${value}"]`)
    if (selectedBtn) {
        selectedBtn.classList.add('active')
    }
    
    filterParticipants()
}

function filterParticipants() {
    const searchName = document.getElementById('searchName').value.toLowerCase().trim()
    const filterBooth = document.getElementById('filterBooth').value

    let filtered = allParticipants.filter(p => {
        // 이름 검색
        if (searchName && !p.name.toLowerCase().includes(searchName)) {
            return false
        }

        // 성별 필터 (버튼)
        if (currentGenderFilter && p.gender !== currentGenderFilter) {
            return false
        }

        // 교급 필터 (버튼)
        if (currentGradeFilter && p.grade !== currentGradeFilter) {
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
    document.getElementById('filterBooth').value = ''
    
    // 버튼 필터 초기화
    setGenderFilter('')
    setGradeFilter('')
    
    filterParticipants()
}

// 참가자 테이블 렌더링 (필터링된 데이터 사용)
function renderParticipantsTable(participants) {
    const tbody = document.getElementById('participantsTableBody')
    
    if (participants.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
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
                ${p.booth_name || '-'}
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="등록일시">
                ${formatDateTime(p.created_at_kst || p.created_at)}
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="방문형태">
                ${p.visit_label || (Number(p.is_duplicate || 0) === 1 ? '재방문' : '첫방문')}
            </td>
            <td class="px-6 py-4 text-gray-600" data-label="참석">
                <label style="display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;">
                    <input type="checkbox" ${Number(p.attended || 0) === 1 ? 'checked' : ''}
                        onchange="toggleParticipantAttendance('${p.id}', this.checked)"
                        style="width: 18px; height: 18px; accent-color: #111827;">
                    <span>${Number(p.attended || 0) === 1 ? '확인' : '미확인'}</span>
                </label>
            </td>
        `
        tbody.appendChild(row)
    })
}

async function toggleParticipantAttendance(participantId, attended) {
    try {
        await ParticipantsAPI.updateAttendance(participantId, attended)
        const participant = allParticipants.find(item => String(item.id) === String(participantId))
        if (participant) {
            participant.attended = attended ? 1 : 0
            participant.attended_at = attended ? new Date().toISOString() : null
        }
        filterParticipants()
    } catch (error) {
        alert('참석 상태 변경에 실패했습니다: ' + error.message)
        await loadParticipants()
    }
}

window.toggleParticipantAttendance = toggleParticipantAttendance

// 행사별 필터링
async function setAdminEventFilter(value) {
    selectedEventId = value || ''
    syncEventFilters()

    const activeTabName = getActiveTabName()
    if (activeTabName === 'overview') {
        await loadOverview()
    } else if (activeTabName === 'booths') {
        await loadBooths()
    } else if (activeTabName === 'participants') {
        await loadParticipants()
    }
    
    // 리더보드 업데이트
    if (selectedEventId) {
        loadLeaderboard(selectedEventId)
    } else {
        // 전체 행사 선택 시 리더보드 숨김
        document.getElementById('leaderboardSection').style.display = 'none'
    }
    
    // 차트 모드가 활성화되어 있으면 차트 모드도 업데이트
    const chartMode = document.getElementById('chartMode')
    if (chartMode && chartMode.classList.contains('active')) {
        updateChartMode()
    }
}

function filterByEvent() {
    const eventFilter = document.getElementById('eventFilter')
    setAdminEventFilter(eventFilter ? eventFilter.value : '')
}

window.setAdminEventFilter = setAdminEventFilter

async function setAdminCountDate(value) {
    selectedCountDate = value || ''
    syncCountDateFilters()
    const activeTabName = getActiveTabName()

    if (activeTabName === 'overview') {
        await loadOverview()
    } else if (activeTabName === 'participants') {
        await loadParticipants()
    }
}

window.setAdminCountDate = setAdminCountDate

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
                const eventId = String(event.id || event.event_id)
                return eventId === String(selectedEventId)
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

// 차트 모드 부스 리더보드 카드 그리드
function updateChartModeBoothChart(boothData) {
    const listContainer = document.getElementById('chartModeBoothList')
    if (!listContainer) return
    
    // 데이터가 없을 때 처리
    if (!boothData || boothData.length === 0) {
        listContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 0; color: #6E6E73;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                <p style="font-size: 0.875rem;">참가자 데이터가 없습니다</p>
            </div>
        `
        return
    }
    
    // 데이터를 참가자 수로 정렬
    boothData.sort((a, b) => b.count - a.count)
    
    // 카드 HTML 생성 (컴팩트 버전)
    let html = ''
    
    boothData.forEach((booth, index) => {
        const rank = index + 1
        
        html += `
            <div class="booth-card" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;"
                 onmouseover="this.style.boxShadow='0 4px 12px rgba(16, 24, 40, 0.08)'"
                 onmouseout="this.style.boxShadow='none'">
                
                <!-- 순위 표시 -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; height: 2rem; padding: 0 0.5rem; background: #F3F4F6; border-radius: 999px; color: #374151; font-weight: 800; font-size: 0.8125rem;">#${rank}</div>
                    <div style="font-size: 0.75rem; color: #6E6E73; font-weight: 600;">${booth.booth_code || ''}</div>
                </div>
                
                <!-- 부스명 -->
                <h4 style="font-size: 1rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${booth.name}
                </h4>
                
                <!-- 참가자 수 -->
                <div style="display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 1.75rem; font-weight: 900; color: #111827; letter-spacing: 0;">${booth.count}</span>
                    <span style="font-size: 0.875rem; color: #6E6E73; font-weight: 600;">명</span>
                </div>
                
                <!-- 행사명 태그 -->
                ${booth.event_name ? `
                <div style="display: inline-block; padding: 0.25rem 0.5rem; background: #F3F4F6; border-radius: 999px; font-size: 0.625rem; color: #4B5563; font-weight: 600;">
                    <i class="fas fa-calendar" style="margin-right: 0.125rem;"></i>${booth.event_name}
                </div>
                ` : ''}
            </div>
        `
    })
    
    // DOM 업데이트
    listContainer.innerHTML = html
    
    // 더미 차트 객체 (호환성 유지)
    chartModeBoothChart = {
        destroy: () => {} // 빈 destroy 메서드
    }
}

// 초기 로드
loadOverview()

// 페이지가 보일 때마다 자동 새로고침
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 현재 활성화된 탭에 따라 새로고침
        const activeTab = document.querySelector('.tab-content.active')
        if (activeTab && activeTab.id === 'tab-overview') {
            loadOverview()
        }
    }
})

// 창이 포커스를 받을 때마다 새로고침
window.addEventListener('focus', () => {
    const activeTab = document.querySelector('.tab-content.active')
    if (activeTab && activeTab.id === 'tab-overview') {
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
                const eventId = String(event.id || event.event_id)
                return eventId === String(selectedEventId)
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

// 행사별 카드 렌더링 (리더보드 스타일)
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
        
        return `
            <div onclick="selectEventFromCard('${eventId}')" 
                style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1.25rem; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);"
                onmouseover="this.style.boxShadow='0 4px 12px rgba(16, 24, 40, 0.08)'"
                onmouseout="this.style.boxShadow='0 1px 2px rgba(16, 24, 40, 0.06)'">
                <div style="color: #111827;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; background: #F3F4F6; border-radius: 8px; color: #6B7280;">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <span style="font-size: 0.875rem; color: #6B7280;">${startDate}${endDate ? ' - ' + endDate : ''}</span>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; letter-spacing: 0;">${eventName}</h3>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #E5E7EB;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <div style="font-size: 2rem; font-weight: 800; letter-spacing: 0;">${participantCount}</div>
                                <div style="font-size: 0.875rem; color: #6B7280;">참가자</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.5rem; font-weight: 800; letter-spacing: 0;">${boothCount}</div>
                                <div style="font-size: 0.875rem; color: #6B7280;">부스</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }).join('')
}

// 부스별 카드 렌더링 (리더보드 스타일)
function renderBoothCards(event) {
    const container = document.getElementById('cardModeGrid')
    const sortOrder = document.getElementById('cardModeSortOrder').value
    
    if (!event || !event.booths) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: rgba(255, 255, 255, 0.8);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p style="font-size: 1rem;">부스 데이터가 없습니다</p>
            </div>
        `
        return
    }
    
    // 뒤로가기 버튼 추가
    const backButton = `
        <div style="grid-column: 1 / -1; margin-bottom: 1rem;">
            <button onclick="backToEventList()" 
                style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #FFFFFF; color: #111827; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;"
                onmouseover="this.style.background='#F9FAFB'"
                onmouseout="this.style.background='#FFFFFF'">
                <i class="fas fa-arrow-left"></i>
                <span>행사 목록으로 돌아가기</span>
            </button>
        </div>
    `
    
    document.getElementById('cardModeDescription').textContent = `${event.name || event.event_name} 행사의 부스별 실적입니다`
    
    // 정렬 (참가자 많은 순으로 고정하여 순위 표시)
    const sortedBooths = [...event.booths].sort((a, b) => {
        const aCount = a.total_participants || a.participant_count || 0
        const bCount = b.total_participants || b.participant_count || 0
        return bCount - aCount
    })
    
    // 카드 생성
    container.innerHTML = backButton + sortedBooths.map((booth, index) => {
        const boothName = booth.name || booth.booth_name
        const participantCount = booth.total_participants || booth.participant_count || 0
        const rank = index + 1
        
        // 성별 분포
        const genderDist = booth.gender_distribution || {}
        const maleCount = genderDist['남성'] || 0
        const femaleCount = genderDist['여성'] || 0
        const totalGender = maleCount + femaleCount
        const malePercent = totalGender > 0 ? Math.round(maleCount/totalGender*100) : 0
        const femalePercent = totalGender > 0 ? Math.round(femaleCount/totalGender*100) : 0
        
        // 교급 분포
        const gradeDist = booth.grade_distribution || {}
        const gradeLabels = ['유아', '초등', '중등', '고등', '성인']
        const gradeIcons = {
            '유아': 'fa-baby',
            '초등': 'fa-child',
            '중등': 'fa-user-graduate',
            '고등': 'fa-user-tie',
            '성인': 'fa-user'
        }
        
        // 교급별 카드 HTML 생성
        const gradeCards = gradeLabels.map(grade => {
            const count = gradeDist[grade] || 0
            const icon = gradeIcons[grade] || 'fa-user'
            const percentage = participantCount > 0 ? Math.round(count / participantCount * 100) : 0
            
            return `
                <div style="text-align: center; padding: 0.5rem; background: #F5F5F7; border-radius: 8px; transition: all 0.2s ease;"
                     onmouseover="this.style.background='#E5E5E7'"
                     onmouseout="this.style.background='#F5F5F7'">
                    <i class="fas ${icon}" style="font-size: 1rem; color: #6E6E73; margin-bottom: 0.25rem; display: block;"></i>
                    <div style="font-size: 0.625rem; color: #6E6E73;">${grade}</div>
                    <div style="font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">${count}명</div>
                    <div style="font-size: 0.625rem; color: #8E8E93;">${percentage}%</div>
                </div>
            `
        }).join('')
        
        return `
            <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1.25rem; cursor: pointer; transition: all 0.2s ease;"
                 onmouseover="this.style.boxShadow='0 4px 12px rgba(16, 24, 40, 0.08)'"
                 onmouseout="this.style.boxShadow='none'">
                
                <!-- 순위 표시 -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 2.25rem; height: 2.25rem; padding: 0 0.625rem; background: #F3F4F6; border-radius: 999px; color: #374151; font-weight: 800; font-size: 0.9375rem;">#${rank}</div>
                    <div style="text-align: right;">
                        <div style="font-size: 2.25rem; font-weight: 900; color: #111827; letter-spacing: 0;">${participantCount}</div>
                        <div style="font-size: 0.875rem; color: #6E6E73; font-weight: 600;">명</div>
                    </div>
                </div>
                
                <!-- 부스명 -->
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0 0 1rem 0; letter-spacing: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${boothName}
                </h3>
                
                <!-- 성별 분포 -->
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #E5E7EB;">
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: #6E6E73;">
                        <span style="font-weight: 600;">
                            <i class="fas fa-venus-mars" style="margin-right: 0.25rem; color: #FF375F;"></i>성별 분포
                        </span>
                        <span style="font-weight: 700; color: #1D1D1F;">${malePercent}% / ${femalePercent}%</span>
                    </div>
                </div>
                
                <!-- 교급 분포 카드 -->
                <div>
                    <div style="font-size: 0.75rem; font-weight: 700; color: #1D1D1F; margin-bottom: 0.5rem; display: flex; align-items: center;">
                        <i class="fas fa-graduation-cap" style="margin-right: 0.25rem; color: #007AFF;"></i>교급 분포
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
                        ${gradeCards}
                    </div>
                </div>
            </div>
        `
    }).join('')
}

// 행사 카드 클릭 시 해당 행사 선택
function selectEventFromCard(eventId) {
    const eventFilter = document.getElementById('eventFilter')
    selectedEventId = eventId
    if (eventFilter) eventFilter.value = eventId
    syncEventFilters()
    
    // 카드 모드 업데이트
    updateCardMode()
}

// 행사 목록으로 돌아가기
function backToEventList() {
    const eventFilter = document.getElementById('eventFilter')
    selectedEventId = ''
    if (eventFilter) eventFilter.value = ''
    syncEventFilters()
    
    // 카드 모드 업데이트 (행사 목록 표시)
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
        return `
            <div class="admin-leaderboard-row" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div style="display: inline-flex; align-items: center; justify-content: center; min-width: 2.5rem; height: 2.5rem; padding: 0 0.625rem; background: #F3F4F6; border-radius: 999px; color: #374151; font-weight: 800;">
                            #${booth.rank}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${booth.booth_name}</h4>
                            <p class="text-xs text-gray-500">코드: ${booth.booth_code}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div style="font-size: 1.75rem; line-height: 1; font-weight: 800; color: #111827;">${booth.participant_count}</div>
                        <div class="text-xs text-gray-500">참가자</div>
                    </div>
                </div>
                
                <!-- 진행률 바 -->
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div style="width: ${percentage}%; height: 0.625rem; border-radius: 999px; background: #0A66D8; transition: width 500ms ease;"></div>
                </div>
                <div class="text-right text-xs text-gray-500 mt-1">${percentage.toFixed(1)}%</div>
                
                ${!booth.is_active ? '<div class="mt-2 text-xs text-red-600"><i class="fas fa-ban mr-1"></i>비활성</div>' : ''}
            </div>
        `
    }).join('')
}

// 전체 참가자 명단 초기화 (관리자 전용)
async function resetAllParticipants() {
    const confirmed = confirm('정말로 전체 참가자 명단을 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 다음 내용이 삭제됩니다:\n- 모든 부스의 참가자 정보\n- 모든 대기열 정보\n\n모든 부스의 데이터가 삭제됩니다!')
    
    if (!confirmed) return
    
    const doubleCheck = confirm('최종 확인\n\n전체 참가자 명단을 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다!')
    
    if (!doubleCheck) return
    
    try {
        const response = await ParticipantsAPI.reset() // booth_id 없이 호출하면 전체 삭제
        alert(response.message + '\n삭제된 항목: ' + response.deleted_count + '개')
        
        // 개요 및 부스 목록 새로고침
        loadOverview()
    } catch (error) {
        console.error('전체 명단 초기화 실패:', error)
        alert('전체 명단 초기화에 실패했습니다.\n' + (error.message || '알 수 없는 오류'))
    }
}

// 특정 부스 참가자 명단 초기화
async function resetBoothParticipants(boothId, boothName) {
    const confirmed = confirm('"' + boothName + '" 부스의 참가자 명단을 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 다음 내용이 삭제됩니다:\n- 해당 부스의 모든 참가자 정보\n- 해당 부스의 대기열 정보')
    
    if (!confirmed) return
    
    try {
        const response = await ParticipantsAPI.reset(boothId)
        alert(response.message + '\n삭제된 항목: ' + response.deleted_count + '개')
        
        // 개요 및 부스 목록 새로고침
        loadOverview()
    } catch (error) {
        console.error('부스 명단 초기화 실패:', error)
        alert('부스 명단 초기화에 실패했습니다.\n' + (error.message || '알 수 없는 오류'))
    }
}

// HTML onclick에서 사용하는 함수들을 전역으로 노출
window.logout = logout
window.switchTab = switchTab
window.loadOverview = loadOverview
window.openEventModal = openEventModal
window.closeEventModal = closeEventModal
window.openBoothModal = openBoothModal
window.closeBoothModal = closeBoothModal
window.resetFilters = resetFilters
window.setGenderFilter = setGenderFilter
window.setGradeFilter = setGradeFilter
window.enterChartMode = enterChartMode
window.exitChartMode = exitChartMode
window.enterCardMode = enterCardMode
window.exitCardMode = exitCardMode
window.resetAllParticipants = resetAllParticipants
window.resetBoothParticipants = resetBoothParticipants
