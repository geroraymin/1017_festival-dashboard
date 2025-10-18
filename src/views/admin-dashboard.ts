/**
 * 관리자 대시보드 페이지
 */

export const adminDashboardPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 대시보드 - 제미나이 부스</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .modal { display: none; }
        .modal.active { display: flex; }
        
        /* 스켈레톤 로더 */
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
        .skeleton-row {
            height: 60px;
            margin-bottom: 0.5rem;
        }
        
        /* 풀스크린 차트 모드 */
        .chart-mode {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            overflow-y: auto;
            display: none;
        }
        .chart-mode.active {
            display: block;
        }
        .chart-mode-header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .chart-mode-content {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        /* 모바일 반응형 */
        @media (max-width: 768px) {
            /* 테이블을 카드형으로 변환 */
            .mobile-card-view thead {
                display: none;
            }
            .mobile-card-view tbody tr {
                display: block;
                margin-bottom: 1rem;
                background: white;
                border-radius: 8px;
                padding: 1rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .mobile-card-view td {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #f3f4f6;
            }
            .mobile-card-view td:last-child {
                border-bottom: none;
            }
            .mobile-card-view td:before {
                content: attr(data-label);
                font-weight: 600;
                color: #6b7280;
            }
            
            /* 탭 버튼 작게 */
            .tab-button {
                font-size: 0.875rem;
                padding: 0.75rem 0.5rem;
            }
            .tab-button i {
                display: none;
            }
            
            /* 차트 모드에서 패딩 줄이기 */
            .chart-mode-content {
                padding: 1rem;
            }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
    <!-- 헤더 -->
    <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-indigo-600 rounded-lg">
                    <i class="fas fa-crown text-white text-xl"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-gray-800">관리자 대시보드</h1>
                    <p class="text-sm text-gray-600" id="adminName">관리자</p>
                </div>
            </div>
            <button onclick="logout()" class="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                <i class="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
            </button>
        </div>
    </header>

    <!-- 탭 네비게이션 -->
    <nav class="bg-white shadow-sm border-b sticky top-16 z-40">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex space-x-8">
                <button onclick="switchTab('overview')" class="tab-button active py-4 px-2 border-b-2 border-indigo-600 text-indigo-600 font-medium">
                    <i class="fas fa-chart-line mr-2"></i>통계 개요
                </button>
                <button onclick="switchTab('events')" class="tab-button py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-indigo-600 font-medium">
                    <i class="fas fa-calendar mr-2"></i>행사 관리
                </button>
                <button onclick="switchTab('booths')" class="tab-button py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-indigo-600 font-medium">
                    <i class="fas fa-store mr-2"></i>부스 관리
                </button>
                <button onclick="switchTab('participants')" class="tab-button py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-indigo-600 font-medium">
                    <i class="fas fa-users mr-2"></i>참가자 관리
                </button>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- 통계 개요 탭 -->
        <div id="tab-overview" class="tab-content active">
            <!-- 행사 선택 필터 및 차트 모드 버튼 -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div class="flex items-center space-x-4">
                        <i class="fas fa-filter text-indigo-600 text-xl"></i>
                        <div>
                            <label for="eventFilter" class="block text-sm font-medium text-gray-700 mb-1">
                                행사 선택
                            </label>
                            <select id="eventFilter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                onchange="filterByEvent()">
                                <option value="">전체 행사</option>
                                <!-- 동적으로 행사 목록이 추가됩니다 -->
                            </select>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-sm text-gray-600 hidden md:block">
                            <i class="fas fa-info-circle mr-1"></i>
                            행사를 선택하면 해당 행사의 통계만 표시됩니다
                        </div>
                        <button onclick="enterChartMode()" 
                            class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition shadow-lg">
                            <i class="fas fa-expand"></i>
                            <span>차트 모드</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 요약 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-users text-4xl opacity-80"></i>
                        <span class="text-3xl font-bold" id="totalParticipants">0</span>
                    </div>
                    <h3 class="text-blue-100 text-sm">총 참가자</h3>
                </div>

                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-calendar text-4xl opacity-80"></i>
                        <span class="text-3xl font-bold" id="totalEvents">0</span>
                    </div>
                    <h3 class="text-purple-100 text-sm">진행 중인 행사</h3>
                </div>

                <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-store text-4xl opacity-80"></i>
                        <span class="text-3xl font-bold" id="totalBooths">0</span>
                    </div>
                    <h3 class="text-pink-100 text-sm">활성 부스</h3>
                </div>

                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-clock text-4xl opacity-80"></i>
                        <span class="text-lg font-bold" id="lastUpdate">--:--</span>
                    </div>
                    <h3 class="text-green-100 text-sm">마지막 업데이트</h3>
                </div>
            </div>

            <!-- 차트 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-chart-pie text-indigo-500 mr-2"></i>
                        전체 성별 분포
                    </h3>
                    <canvas id="overallGenderChart"></canvas>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-chart-bar text-purple-500 mr-2"></i>
                        전체 교급 분포
                    </h3>
                    <canvas id="overallGradeChart"></canvas>
                </div>
            </div>
        </div>

        <!-- 행사 관리 탭 -->
        <div id="tab-events" class="tab-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-calendar mr-2"></i>행사 목록
                </h2>
                <button onclick="openEventModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition">
                    <i class="fas fa-plus mr-2"></i>새 행사 추가
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <table class="w-full mobile-card-view">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">행사명</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">기간</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">부스 수</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">참가자</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">액션</th>
                        </tr>
                    </thead>
                    <tbody id="eventsTableBody" class="divide-y">
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>데이터 로딩 중...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 부스 관리 탭 -->
        <div id="tab-booths" class="tab-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-store mr-2"></i>부스 목록
                </h2>
                <button onclick="openBoothModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition">
                    <i class="fas fa-plus mr-2"></i>새 부스 추가
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <table class="w-full mobile-card-view">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">부스명</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">행사</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">부스 코드</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">참가자</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">액션</th>
                        </tr>
                    </thead>
                    <tbody id="boothsTableBody" class="divide-y">
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>데이터 로딩 중...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 참가자 관리 탭 -->
        <div id="tab-participants" class="tab-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-users mr-2"></i>참가자 목록
                </h2>
                <button onclick="exportCSV()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition">
                    <i class="fas fa-file-csv mr-2"></i>CSV 다운로드
                </button>
            </div>

            <!-- 검색 및 필터 -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <!-- 이름 검색 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-search mr-1"></i>이름 검색
                        </label>
                        <input type="text" id="searchName" placeholder="이름 입력..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            oninput="filterParticipants()">
                    </div>

                    <!-- 성별 필터 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-venus-mars mr-1"></i>성별
                        </label>
                        <select id="filterGender" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            onchange="filterParticipants()">
                            <option value="">전체</option>
                            <option value="남성">남성</option>
                            <option value="여성">여성</option>
                        </select>
                    </div>

                    <!-- 교급 필터 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-graduation-cap mr-1"></i>교급
                        </label>
                        <select id="filterGrade" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            onchange="filterParticipants()">
                            <option value="">전체</option>
                            <option value="유아">유아</option>
                            <option value="초등">초등</option>
                            <option value="중등">중등</option>
                            <option value="고등">고등</option>
                            <option value="성인">성인</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    <!-- 부스 필터 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-store mr-1"></i>부스
                        </label>
                        <select id="filterBooth" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            onchange="filterParticipants()">
                            <option value="">전체</option>
                            <!-- 동적으로 부스 목록이 추가됩니다 -->
                        </select>
                    </div>
                </div>

                <!-- 필터 결과 및 초기화 -->
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-filter mr-1"></i>
                        검색 결과: <span id="filteredCount" class="font-semibold text-indigo-600">0</span>명 / 
                        전체 <span id="totalCount" class="font-semibold">0</span>명
                    </div>
                    <button onclick="resetFilters()" 
                        class="text-sm text-gray-600 hover:text-indigo-600 transition">
                        <i class="fas fa-redo mr-1"></i>필터 초기화
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <table class="w-full mobile-card-view">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">이름</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">성별</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">교급</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">부스</th>
                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">등록일시</th>
                        </tr>
                    </thead>
                    <tbody id="participantsTableBody" class="divide-y">
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>데이터 로딩 중...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- 행사 생성 모달 -->
    <div id="eventModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">새 행사 추가</h3>
            <form id="eventForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">행사명</label>
                    <input type="text" id="eventName" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                    <input type="date" id="eventStartDate" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                    <input type="date" id="eventEndDate" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
                <div class="flex gap-3 mt-6">
                    <button type="button" onclick="closeEventModal()"
                        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium">
                        취소
                    </button>
                    <button type="submit"
                        class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium">
                        생성
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 부스 생성 모달 -->
    <div id="boothModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">새 부스 추가</h3>
            <form id="boothForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">행사 선택</label>
                    <select id="boothEventId" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option value="">행사를 선택하세요</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">부스명</label>
                    <input type="text" id="boothName" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                    <textarea id="boothDescription" rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <div class="flex gap-3 mt-6">
                    <button type="button" onclick="closeBoothModal()"
                        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium">
                        취소
                    </button>
                    <button type="submit"
                        class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium">
                        생성
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 풀스크린 차트 모드 -->
    <div id="chartMode" class="chart-mode">
        <!-- 헤더 -->
        <div class="chart-mode-header">
            <div class="flex items-center justify-between text-white">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-chart-line text-2xl"></i>
                    <div>
                        <h2 class="text-xl font-bold">통계 대시보드</h2>
                        <p class="text-sm opacity-80" id="chartModeEventName">전체 행사</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-sm opacity-80">
                        <i class="fas fa-sync-alt mr-1"></i>
                        <span id="chartModeUpdateTime">--:--</span>
                    </div>
                    <button onclick="exitChartMode()" 
                        class="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition">
                        <i class="fas fa-times"></i>
                        <span>닫기 (ESC)</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 차트 콘텐츠 -->
        <div class="chart-mode-content">
            <!-- 요약 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-users text-4xl text-blue-600"></i>
                        <span class="text-4xl font-bold text-gray-800" id="chartModeTotalParticipants">0</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium">총 참가자</h3>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-calendar text-4xl text-purple-600"></i>
                        <span class="text-4xl font-bold text-gray-800" id="chartModeTotalEvents">0</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium">진행 중인 행사</h3>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-store text-4xl text-pink-600"></i>
                        <span class="text-4xl font-bold text-gray-800" id="chartModeTotalBooths">0</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium">활성 부스</h3>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <i class="fas fa-chart-pie text-4xl text-green-600"></i>
                        <span class="text-2xl font-bold text-gray-800" id="chartModeGenderRatio">50% / 50%</span>
                    </div>
                    <h3 class="text-gray-600 text-sm font-medium">남성 / 여성 비율</h3>
                </div>
            </div>

            <!-- 차트 그리드 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-8">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-chart-pie text-indigo-500 mr-2"></i>
                        성별 분포
                    </h3>
                    <canvas id="chartModeGenderChart" style="max-height: 400px;"></canvas>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-8">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-chart-bar text-purple-500 mr-2"></i>
                        교급 분포
                    </h3>
                    <canvas id="chartModeGradeChart" style="max-height: 400px;"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script src="/static/js/admin-dashboard.js"></script>
</body>
</html>
`
