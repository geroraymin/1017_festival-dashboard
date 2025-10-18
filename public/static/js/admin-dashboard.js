/**
 * 관리자 대시보드 JavaScript
 */

let overallGenderChart, overallGradeChart
let allEvents = []
let allBooths = []
let allParticipants = []

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

        // 총 참가자
        document.getElementById('totalParticipants').textContent = data.total_participants

        // 행사 및 부스 수
        document.getElementById('totalEvents').textContent = data.events.length

        let totalBooths = 0
        data.events.forEach(event => {
            totalBooths += event.booth_count
        })
        document.getElementById('totalBooths').textContent = totalBooths

        // 마지막 업데이트 시간
        const now = new Date()
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        })

        // 전체 성별/교급 분포 계산
        let genderDistribution = { male: 0, female: 0 }
        let gradeDistribution = { infant: 0, elementary: 0, middle: 0, high: 0, adult: 0, other: 0 }

        data.events.forEach(event => {
            event.booths.forEach(booth => {
                genderDistribution.male += booth.gender_distribution.male
                genderDistribution.female += booth.gender_distribution.female

                gradeDistribution.infant += booth.grade_distribution.infant || 0
                gradeDistribution.elementary += booth.grade_distribution.elementary
                gradeDistribution.middle += booth.grade_distribution.middle
                gradeDistribution.high += booth.grade_distribution.high
                gradeDistribution.adult += booth.grade_distribution.adult || 0
                gradeDistribution.other += booth.grade_distribution.other
            })
        })

        updateOverallGenderChart(genderDistribution)
        updateOverallGradeChart(gradeDistribution)
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

    overallGenderChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['남성', '여성'],
            datasets: [{
                data: [data.male, data.female],
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

// 전체 교급 분포 차트
function updateOverallGradeChart(data) {
    const ctx = document.getElementById('overallGradeChart').getContext('2d')

    if (overallGradeChart) {
        overallGradeChart.destroy()
    }

    overallGradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['유아', '초등', '중등', '고등', '성인', '기타'],
            datasets: [{
                label: '참가자 수',
                data: [data.infant || 0, data.elementary, data.middle, data.high, data.adult || 0, data.other],
                backgroundColor: ['#fbbf24', '#8b5cf6', '#06b6d4', '#10b981', '#6366f1', '#9ca3af']
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

            // 참가자 수 계산 (임시)
            const participantCount = 0

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
            // 참가자 수 계산 (임시)
            const participantCount = 0

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

        const tbody = document.getElementById('participantsTableBody')
        tbody.innerHTML = ''

        if (allParticipants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        등록된 참가자가 없습니다.
                    </td>
                </tr>
            `
            return
        }

        allParticipants.forEach(participant => {
            const row = document.createElement('tr')
            row.className = 'hover:bg-gray-50'
            row.innerHTML = `
                <td class="px-6 py-4" data-label="이름">
                    <div class="font-medium text-gray-900">${participant.name}</div>
                </td>
                <td class="px-6 py-4 text-gray-600" data-label="성별">${participant.gender}</td>
                <td class="px-6 py-4 text-gray-600" data-label="교급">${participant.grade}</td>
                <td class="px-6 py-4 text-gray-600" data-label="부스">${participant.booths?.name || '-'}</td>
                <td class="px-6 py-4 text-gray-600" data-label="등록일시">${formatDateTime(participant.created_at)}</td>
            `
            tbody.appendChild(row)
        })
    } catch (error) {
        console.error('참가자 목록 로드 실패:', error)
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
    if (allParticipants.length === 0) {
        alert('내보낼 데이터가 없습니다.')
        return
    }

    // CSV 헤더
    let csv = '이름,성별,교급,생년월일,부스명,등록일시\\n'

    // CSV 데이터
    allParticipants.forEach(p => {
        csv += `${p.name},${p.gender},${p.grade},${p.date_of_birth},${p.booths?.name || '-'},${formatDateTime(p.created_at)}\\n`
    })

    // 다운로드
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

// 초기 로드
loadOverview()
