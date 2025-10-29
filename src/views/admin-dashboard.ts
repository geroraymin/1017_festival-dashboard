/**
 * 관리자 대시보드 페이지
 */

export const adminDashboardPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 대시보드 - 축제 디지털방명록 시스템</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>
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
            padding: 1rem;
            max-width: 1600px;
            margin: 0 auto;
            height: calc(100vh - 80px);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
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
                font-size: 0.75rem;
                padding: 0.75rem 0.25rem;
            }
            .tab-button i {
                display: none;
            }
            
            /* 차트/카드 모드 헤더 패딩 줄이기 */
            .chart-mode-header {
                padding: 0.75rem 0.5rem;
            }
            
            /* 차트/카드 모드 콘텐츠 패딩 줄이기 */
            .chart-mode-content {
                padding: 0.5rem;
            }
            
            /* 모바일에서 차트 높이 더 줄이기 */
            .chart-mode-content > div > div > div[style*="height"] {
                height: auto !important;
                min-height: 120px;
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
            <!-- 행사 선택 필터 및 모드 버튼 -->
            <div class="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <!-- 행사 선택 (전체 너비) -->
                <div class="flex items-center gap-2 mb-3">
                    <i class="fas fa-filter text-indigo-600 text-base sm:text-lg flex-shrink-0"></i>
                    <div class="flex-1 min-w-0">
                        <label for="eventFilter" class="block text-xs font-medium text-gray-700 mb-1">
                            행사 선택
                        </label>
                        <select id="eventFilter" 
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            onchange="filterByEvent()">
                            <option value="">전체 행사</option>
                            <!-- 동적으로 행사 목록이 추가됩니다 -->
                        </select>
                    </div>
                </div>
                
                <!-- 버튼 그룹 (전체 너비, 균등 분할) -->
                <div class="grid grid-cols-3 gap-2">
                    <button onclick="loadOverview()" 
                        class="flex items-center justify-center gap-1 px-2 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium transition shadow-sm">
                        <i class="fas fa-sync-alt"></i>
                        <span class="hidden sm:inline">새로고침</span>
                    </button>
                    <button onclick="enterChartMode()" 
                        class="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-lg">
                        <i class="fas fa-chart-line"></i>
                        <span>차트</span>
                    </button>
                    <button onclick="enterCardMode()" 
                        class="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg text-xs sm:text-sm font-medium transition shadow-lg">
                        <i class="fas fa-th-large"></i>
                        <span>카드</span>
                    </button>
                </div>
                
                <!-- 안내 문구 (모바일에서는 숨김) -->
                <div class="text-xs text-gray-600 mt-3 hidden lg:block">
                    <i class="fas fa-info-circle mr-1"></i>
                    행사를 선택하면 해당 행사의 통계만 표시됩니다
                </div>
            </div>

            <!-- 요약 카드 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-gray-800" id="totalParticipants">0</div>
                            <div class="text-xs text-gray-600 mt-1">총 참가자</div>
                        </div>
                        <i class="fas fa-users text-3xl text-blue-500 opacity-60"></i>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-gray-800" id="totalEvents">0</div>
                            <div class="text-xs text-gray-600 mt-1">진행 중인 행사</div>
                        </div>
                        <i class="fas fa-calendar text-3xl text-purple-500 opacity-60"></i>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-4 border-l-4 border-pink-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-gray-800" id="totalBooths">0</div>
                            <div class="text-xs text-gray-600 mt-1">활성 부스</div>
                        </div>
                        <i class="fas fa-store text-3xl text-pink-500 opacity-60"></i>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm font-bold text-gray-800" id="lastUpdate">--:--</div>
                            <div class="text-xs text-gray-600 mt-1">마지막 업데이트</div>
                        </div>
                        <i class="fas fa-clock text-3xl text-green-500 opacity-60"></i>
                    </div>
                </div>
            </div>

            <!-- 차트 그리드 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- 성별 분포 -->
                <div class="bg-white rounded-xl shadow-lg p-5">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-venus-mars text-pink-500 mr-2"></i>
                        성별 분포
                    </h3>
                    <div style="height: 220px;">
                        <canvas id="overallGenderChart"></canvas>
                    </div>
                    <!-- 성별 통계 테이블 -->
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <div id="genderStatsTable" class="grid grid-cols-2 gap-3 text-center"></div>
                    </div>
                </div>

                <!-- 교급 분포 -->
                <div class="bg-white rounded-xl shadow-lg p-5">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <i class="fas fa-graduation-cap text-blue-500 mr-2"></i>
                        교급 분포
                    </h3>
                    <div style="height: 220px;">
                        <canvas id="overallGradeChart"></canvas>
                    </div>
                    <!-- 교급 통계 테이블 -->
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <div id="gradeStatsTable" class="grid grid-cols-5 gap-2 text-center"></div>
                    </div>
                </div>
            </div>

            <!-- 부스별 참가자 수 차트 -->
            <div class="bg-white rounded-xl shadow-lg p-5 mb-6">
                <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-store-alt text-indigo-500 mr-2"></i>
                    부스별 참가자 현황
                </h3>
                <div style="height: 300px;">
                    <canvas id="overallBoothChart"></canvas>
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
            <div class="flex items-center justify-between text-white gap-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <i class="fas fa-chart-line text-xl sm:text-2xl"></i>
                    <div class="min-w-0">
                        <h2 class="text-base sm:text-xl font-bold truncate">통계 대시보드</h2>
                        <p class="text-xs sm:text-sm opacity-80 truncate" id="chartModeEventName">전체 행사</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <div class="text-xs sm:text-sm opacity-80 hidden sm:flex items-center">
                        <i class="fas fa-sync-alt mr-1"></i>
                        <span id="chartModeUpdateTime">--:--</span>
                    </div>
                    <button onclick="exitChartMode()" 
                        class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-sm sm:text-base">
                        <i class="fas fa-times"></i>
                        <span class="hidden sm:inline">닫기 (ESC)</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 차트 콘텐츠 -->
        <div class="chart-mode-content">
            <!-- 요약 카드 (더 컴팩트하게) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div class="bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-2xl p-2">
                    <div class="flex items-center justify-between">
                        <i class="fas fa-users text-xl text-blue-600"></i>
                        <span class="text-2xl font-bold text-gray-800" id="chartModeTotalParticipants">0</span>
                    </div>
                    <h3 class="text-gray-600 text-xs font-medium mt-1">총 참가자</h3>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-2xl p-2">
                    <div class="flex items-center justify-between">
                        <i class="fas fa-calendar text-xl text-purple-600"></i>
                        <span class="text-2xl font-bold text-gray-800" id="chartModeTotalEvents">0</span>
                    </div>
                    <h3 class="text-gray-600 text-xs font-medium mt-1">진행 중인 행사</h3>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-2xl p-2">
                    <div class="flex items-center justify-between">
                        <i class="fas fa-store text-xl text-pink-600"></i>
                        <span class="text-2xl font-bold text-gray-800" id="chartModeTotalBooths">0</span>
                    </div>
                    <h3 class="text-gray-600 text-xs font-medium mt-1">활성 부스</h3>
                </div>

                <div class="bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-2xl p-2">
                    <div class="flex items-center justify-between">
                        <i class="fas fa-chart-pie text-xl text-green-600"></i>
                        <span class="text-lg font-bold text-gray-800" id="chartModeGenderRatio">50% / 50%</span>
                    </div>
                    <h3 class="text-gray-600 text-xs font-medium mt-1">남성 / 여성 비율</h3>
                </div>
            </div>

            <!-- 차트 그리드 (더 작은 높이와 패딩) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <!-- 성별 분포 -->
                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-3">
                    <h3 class="text-base font-bold text-gray-800 mb-2">
                        <i class="fas fa-venus-mars text-pink-500 mr-1"></i>
                        성별 분포
                    </h3>
                    <div style="height: 160px;">
                        <canvas id="chartModeGenderChart"></canvas>
                    </div>
                    <!-- 성별 통계 테이블 (더 컴팩트하게) -->
                    <div class="mt-2 pt-2 border-t border-gray-200">
                        <div id="chartModeGenderStatsTable" class="grid grid-cols-2 gap-2 text-center text-xs"></div>
                    </div>
                </div>

                <!-- 교급 분포 -->
                <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-3">
                    <h3 class="text-base font-bold text-gray-800 mb-2">
                        <i class="fas fa-graduation-cap text-blue-500 mr-1"></i>
                        교급 분포
                    </h3>
                    <div style="height: 160px;">
                        <canvas id="chartModeGradeChart"></canvas>
                    </div>
                    <!-- 교급 통계 테이블 (더 컴팩트하게) -->
                    <div class="mt-2 pt-2 border-t border-gray-200">
                        <div id="chartModeGradeStatsTable" class="grid grid-cols-5 gap-1 text-center text-xs"></div>
                    </div>
                </div>
            </div>

            <!-- 부스별 참가자 현황 (더 작은 높이) -->
            <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-3">
                <h3 class="text-base font-bold text-gray-800 mb-2">
                    <i class="fas fa-store-alt text-indigo-500 mr-1"></i>
                    부스별 참가자 현황
                </h3>
                <div style="height: 200px;">
                    <canvas id="chartModeBoothChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- 풀스크린 카드 모드 -->
    <div id="cardMode" class="chart-mode">
        <!-- 헤더 -->
        <div class="chart-mode-header">
            <div class="flex items-center justify-between text-white gap-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <i class="fas fa-th-large text-xl sm:text-2xl"></i>
                    <div class="min-w-0">
                        <h2 class="text-base sm:text-xl font-bold truncate">실적 대시보드</h2>
                        <p class="text-xs sm:text-sm opacity-80 truncate" id="cardModeEventName">전체 행사</p>
                    </div>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <!-- 정렬 토글 -->
                    <select id="cardModeSortOrder" onchange="updateCardMode()"
                        class="px-2 py-1.5 sm:px-3 sm:py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-xs sm:text-sm border-none outline-none cursor-pointer">
                        <option value="count" class="text-gray-800">많은 순</option>
                        <option value="date" class="text-gray-800">일자 순</option>
                    </select>
                    <div class="text-xs sm:text-sm opacity-80 hidden sm:flex items-center">
                        <i class="fas fa-sync-alt mr-1"></i>
                        <span id="cardModeUpdateTime">--:--</span>
                    </div>
                    <button onclick="exitCardMode()" 
                        class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-sm sm:text-base">
                        <i class="fas fa-times"></i>
                        <span class="hidden sm:inline">닫기 (ESC)</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 카드 콘텐츠 -->
        <div class="chart-mode-content">
            <!-- 요약 정보 -->
            <div class="bg-white bg-opacity-95 backdrop-blur rounded-xl shadow-2xl p-4 mb-4">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div class="flex items-center space-x-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-indigo-600" id="cardModeTotalParticipants">0</div>
                            <div class="text-sm text-gray-600 mt-1">총 참가자</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600" id="cardModeTotalEvents">0</div>
                            <div class="text-sm text-gray-600 mt-1">진행 행사</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-pink-600" id="cardModeTotalBooths">0</div>
                            <div class="text-sm text-gray-600 mt-1">활성 부스</div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-info-circle mr-1"></i>
                        <span id="cardModeDescription">카드를 클릭하여 상세 정보를 확인하세요</span>
                    </div>
                </div>
            </div>

            <!-- 카드 그리드 -->
            <div id="cardModeGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <!-- 카드들이 동적으로 추가됩니다 -->
            </div>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script src="/static/js/admin-dashboard.js"></script>
</body>
</html>
`
