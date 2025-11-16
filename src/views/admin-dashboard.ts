/**
 * 관리자 대시보드 페이지 - Apple HIG
 */

export const adminDashboardPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 대시보드 - 축제 디지털방명록 시스템</title>
    <link rel="stylesheet" href="/static/style.css">
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
        
        /* 필터 버튼 스타일 */
        .filter-btn {
            border: 2px solid #e5e7eb;
            background: white;
            color: #6b7280;
            cursor: pointer;
        }
        .filter-btn:hover {
            border-color: #6366f1;
            background: #eef2ff;
            color: #6366f1;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
        }
        .filter-btn.active {
            border-color: #6366f1;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
        }
        .filter-btn.active:hover {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
<body style="background: linear-gradient(135deg, #F5F7FA 0%, #E3F2FD 100%); min-height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;">
    <!-- 헤더 -->
    <header style="background: rgba(255, 255, 255, 0.95); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(20px);">
        <div style="max-width: 1280px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="padding: 0.5rem; background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%); border-radius: 12px;">
                    <i class="fas fa-crown" style="color: white; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <h1 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0; letter-spacing: -0.5px;">관리자 대시보드</h1>
                    <p class="text-body" style="font-size: 0.875rem; color: #6E6E73; margin: 0;" id="adminName">관리자</p>
                </div>
            </div>
            <button onclick="logout()" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #FF375F; color: white; border: none; border-radius: 12px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-height: 44px;" onmouseover="this.style.background='#E8204E'" onmouseout="this.style.background='#FF375F'">
                <i class="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
            </button>
        </div>
    </header>

    <!-- 탭 네비게이션 -->
    <nav style="background: rgba(255, 255, 255, 0.95); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); border-bottom: 1px solid #E5E5E7; position: sticky; top: 64px; z-index: 40; backdrop-filter: blur(20px);">
        <div style="max-width: 1280px; margin: 0 auto; padding: 0 1.5rem;">
            <div style="display: flex; gap: 2rem;">
                <button onclick="switchTab('overview')" class="tab-button active" style="padding: 1rem 0.5rem; border: none; border-bottom: 2px solid #007AFF; background: none; color: #007AFF; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease;">
                    <i class="fas fa-chart-line" style="margin-right: 0.5rem;"></i>통계 개요
                </button>
                <button onclick="switchTab('events')" class="tab-button" style="padding: 1rem 0.5rem; border: none; border-bottom: 2px solid transparent; background: none; color: #6E6E73; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease;">
                    <i class="fas fa-calendar" style="margin-right: 0.5rem;"></i>행사 관리
                </button>
                <button onclick="switchTab('booths')" class="tab-button" style="padding: 1rem 0.5rem; border: none; border-bottom: 2px solid transparent; background: none; color: #6E6E73; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease;">
                    <i class="fas fa-store" style="margin-right: 0.5rem;"></i>부스 관리
                </button>
                <button onclick="switchTab('participants')" class="tab-button" style="padding: 1rem 0.5rem; border: none; border-bottom: 2px solid transparent; background: none; color: #6E6E73; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease;">
                    <i class="fas fa-users" style="margin-right: 0.5rem;"></i>참가자 관리
                </button>
            </div>
        </div>
    </nav>

    <main style="max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem;">
        <!-- 통계 개요 탭 -->
        <div id="tab-overview" class="tab-content active">
            <!-- 행사 선택 필터 및 모드 버튼 -->
            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; margin-bottom: 1.5rem; backdrop-filter: blur(20px);">
                <!-- 행사 선택 (전체 너비) -->
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <i class="fas fa-filter" style="color: #5856D6; font-size: 1.125rem;"></i>
                    <div style="flex: 1; min-width: 0;">
                        <label for="eventFilter" style="display: block; font-size: 0.875rem; font-weight: 600; color: #6E6E73; margin-bottom: 0.25rem;">
                            행사 선택
                        </label>
                        <select id="eventFilter" 
                            style="width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;"
                            onchange="filterByEvent()" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'">
                            <option value="">전체 행사</option>
                            <!-- 동적으로 행사 목록이 추가됩니다 -->
                        </select>
                    </div>
                </div>
                
                <!-- 버튼 그룹 (전체 너비, 균등 분할) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.5rem;">
                    <button onclick="loadOverview()" 
                        style="display: flex; align-items: center; justify-content: center; gap: 0.25rem; padding: 0.625rem 0.75rem; background: rgba(255, 255, 255, 0.95); color: #1D1D1F; border: 2px solid #E5E5E7; border-radius: 12px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-height: 44px; backdrop-filter: blur(20px);" onmouseover="this.style.background='#F5F5F7'; this.style.borderColor='#007AFF'" onmouseout="this.style.background='rgba(255, 255, 255, 0.95)'; this.style.borderColor='#E5E5E7'">
                        <i class="fas fa-sync-alt"></i>
                        <span>새로고침</span>
                    </button>
                    <button onclick="exportDataBackup()" 
                        style="display: flex; align-items: center; justify-content: center; gap: 0.25rem; padding: 0.625rem 0.75rem; background: linear-gradient(135deg, #32D74B 0%, #30BE47 100%); color: white; border: none; border-radius: 12px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(50, 215, 75, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #30BE47 0%, #28A745 100)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(50, 215, 75, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #32D74B 0%, #30BE47 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(50, 215, 75, 0.3)'">
                        <i class="fas fa-database"></i>
                        <span>백업</span>
                    </button>
                    <button onclick="enterChartMode()" 
                        style="display: flex; align-items: center; justify-content: center; gap: 0.25rem; padding: 0.625rem 0.75rem; background: linear-gradient(135deg, #5856D6 0%, #4F46E5 100%); color: white; border: none; border-radius: 12px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(88, 86, 214, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #5856D6 0%, #4F46E5 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(88, 86, 214, 0.3)'">
                        <i class="fas fa-chart-line"></i>
                        <span>차트</span>
                    </button>
                    <button onclick="enterCardMode()" 
                        style="display: flex; align-items: center; justify-content: center; gap: 0.25rem; padding: 0.625rem 0.75rem; background: linear-gradient(135deg, #FF375F 0%, #E8204E 100%); color: white; border: none; border-radius: 12px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(255, 55, 95, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #E8204E 0%, #D70040 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(255, 55, 95, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #FF375F 0%, #E8204E 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(255, 55, 95, 0.3)'">
                        <i class="fas fa-th-large"></i>
                        <span>카드</span>
                    </button>
                </div>
                
                <!-- 안내 문구 -->
                <div style="font-size: 0.75rem; color: #6E6E73; margin-top: 0.75rem;">
                    <i class="fas fa-info-circle mr-1"></i>
                    행사를 선택하면 해당 행사의 통계만 표시됩니다
                </div>
            </div>

            <!-- 요약 카드 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; border-left: 4px solid #007AFF; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="totalParticipants">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">연인원</div>
                        </div>
                        <i class="fas fa-users" style="font-size: 2.5rem; color: #007AFF; opacity: 0.5;"></i>
                    </div>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; border-left: 4px solid #32D74B; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="uniqueParticipants">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">실인원</div>
                        </div>
                        <i class="fas fa-user-check" style="font-size: 2.5rem; color: #32D74B; opacity: 0.5;"></i>
                    </div>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; border-left: 4px solid #5856D6; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="totalEvents">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">진행 중인 행사</div>
                        </div>
                        <i class="fas fa-calendar" style="font-size: 2.5rem; color: #5856D6; opacity: 0.5;"></i>
                    </div>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; border-left: 4px solid #FF375F; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="totalBooths">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">활성 부스</div>
                        </div>
                        <i class="fas fa-store" style="font-size: 2.5rem; color: #FF375F; opacity: 0.5;"></i>
                    </div>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; border-left: 4px solid #32D74B; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; letter-spacing: -0.5px;" id="lastUpdate">--:--</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">마지막 업데이트</div>
                        </div>
                        <i class="fas fa-clock" style="font-size: 2.5rem; color: #32D74B; opacity: 0.5;"></i>
                    </div>
                </div>
            </div>

            <!-- 차트 그리드 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                <!-- 성별 분포 -->
                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <h3 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin-bottom: 1rem; display: flex; align-items: center; letter-spacing: -0.5px;">
                        <i class="fas fa-venus-mars" style="color: #FF375F; margin-right: 0.5rem;"></i>
                        성별 분포
                    </h3>
                    <div style="height: 220px;">
                        <canvas id="overallGenderChart"></canvas>
                    </div>
                    <!-- 성별 통계 테이블 -->
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #E5E5E7;">
                        <div id="genderStatsTable" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; text-align: center;"></div>
                    </div>
                </div>

                <!-- 교급 분포 -->
                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <h3 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin-bottom: 1rem; display: flex; align-items: center; letter-spacing: -0.5px;">
                        <i class="fas fa-graduation-cap" style="color: #007AFF; margin-right: 0.5rem;"></i>
                        교급 분포
                    </h3>
                    <div style="height: 220px;">
                        <canvas id="overallGradeChart"></canvas>
                    </div>
                    <!-- 교급 통계 테이블 -->
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #E5E5E7;">
                        <div id="gradeStatsTable" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; text-align: center;"></div>
                    </div>
                </div>
            </div>

            <!-- 부스별 참가자 수 차트 -->
            <div class="bg-white rounded-xl shadow-lg p-5 mb-6">
                <h3 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin-bottom: 1rem; display: flex; align-items: center; letter-spacing: -0.5px;">
                    <i class="fas fa-store-alt" style="color: #5856D6; margin-right: 0.5rem;"></i>
                    부스별 참가자 현황
                </h3>
                <div style="height: 300px;">
                    <canvas id="overallBoothChart"></canvas>
                </div>
            </div>

            <!-- 부스 리더보드 -->
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-5 mb-6" id="leaderboardSection" style="display: none;">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-title2" style="font-size: 1.5rem; font-weight: 700; color: #1D1D1F; display: flex; align-items: center; letter-spacing: -0.5px;">
                        <i class="fas fa-trophy" style="color: #FFD60A; margin-right: 0.5rem;"></i>
                        부스 순위 리더보드
                    </h3>
                    <div style="font-size: 0.875rem; color: #6E6E73; font-weight: 600;" id="leaderboardEventName"></div>
                </div>
                
                <div id="leaderboardContent">
                    <!-- 로딩 중 -->
                    <div id="leaderboardLoading" style="text-align: center; padding: 2rem 0;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #C7C7CC;"></i>
                        <p style="color: #6E6E73; margin-top: 0.5rem; font-size: 0.9375rem;">순위를 불러오는 중...</p>
                    </div>
                    
                    <!-- 리더보드 목록 -->
                    <div id="leaderboardList" style="display: none;">
                        <!-- 동적으로 추가됨 -->
                    </div>
                    
                    <!-- 데이터 없음 -->
                    <div id="leaderboardEmpty" style="display: none;" class="text-center py-8 text-gray-600">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 0.5rem; display: block;"></i>
                        <p>참가자 데이터가 없습니다</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 행사 관리 탭 -->
        <div id="tab-events" class="tab-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 class="text-title1" style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;">
                    <i class="fas fa-calendar" style="margin-right: 0.5rem;"></i>행사 목록
                </h2>
                <button onclick="openEventModal()" style="background: linear-gradient(135deg, #5856D6 0%, #4F46E5 100%); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(88, 86, 214, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #5856D6 0%, #4F46E5 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(88, 86, 214, 0.3)'">
                    <i class="fas fa-plus" style="margin-right: 0.5rem;"></i>새 행사 추가
                </button>
            </div>

            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); overflow: hidden; backdrop-filter: blur(20px);">
                <table class="mobile-card-view" style="width: 100%;">
                    <thead style="background: #F5F5F7; border-bottom: 2px solid #E5E5E7;">
                        <tr>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">행사명</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">기간</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">부스 수</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">참가자</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">상태</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">액션</th>
                        </tr>
                    </thead>
                    <tbody id="eventsTableBody" style="border-top: 2px solid #E5E5E7;">
                        <tr>
                            <td colspan="6" style="padding: 2rem 1.5rem; text-align: center; color: #6E6E73;">
                                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                                <p>데이터 로딩 중...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 부스 관리 탭 -->
        <div id="tab-booths" class="tab-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 class="text-title1" style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;">
                    <i class="fas fa-store" style="margin-right: 0.5rem;"></i>부스 목록
                </h2>
                <button onclick="openBoothModal()" style="background: linear-gradient(135deg, #5856D6 0%, #4F46E5 100%); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(88, 86, 214, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #5856D6 0%, #4F46E5 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(88, 86, 214, 0.3)'">
                    <i class="fas fa-plus" style="margin-right: 0.5rem;"></i>새 부스 추가
                </button>
            </div>

            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); overflow: hidden; backdrop-filter: blur(20px);">
                <table class="mobile-card-view" style="width: 100%;">
                    <thead style="background: #F5F5F7; border-bottom: 2px solid #E5E5E7;">
                        <tr>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">부스명</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">행사</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">부스 코드</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">참가자</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">상태</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">액션</th>
                        </tr>
                    </thead>
                    <tbody id="boothsTableBody" style="border-top: 2px solid #E5E5E7;">
                        <tr>
                            <td colspan="6" style="padding: 2rem 1.5rem; text-align: center; color: #6E6E73;">
                                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                                <p>데이터 로딩 중...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 참가자 관리 탭 -->
        <div id="tab-participants" class="tab-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 class="text-title1" style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;">
                    <i class="fas fa-users" style="margin-right: 0.5rem;"></i>참가자 목록
                </h2>
                <button onclick="exportCSV()" style="background: linear-gradient(135deg, #32D74B 0%, #30BE47 100%); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(50, 215, 75, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #30BE47 0%, #28A745 100)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(50, 215, 75, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #32D74B 0%, #30BE47 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(50, 215, 75, 0.3)'">
                    <i class="fas fa-file-csv" style="margin-right: 0.5rem;"></i>CSV 다운로드
                </button>
            </div>

            <!-- 검색 및 필터 -->
            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; margin-bottom: 1.5rem; backdrop-filter: blur(20px);">
                <!-- 이름 검색 -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">
                        <i class="fas fa-search mr-1"></i>이름 검색
                    </label>
                    <input type="text" id="searchName" placeholder="이름 입력..."
                        style="width: 100%; padding: 0.5rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'"
                        oninput="filterParticipants()">
                </div>

                <!-- 성별 필터 (버튼형) -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">
                        <i class="fas fa-venus-mars mr-1"></i>성별
                    </label>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        <button onclick="setGenderFilter('')" 
                            class="filter-btn filter-btn-gender active" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="">
                            <i class="fas fa-users mr-1"></i>전체
                        </button>
                        <button onclick="setGenderFilter('남성')" 
                            class="filter-btn filter-btn-gender" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="남성">
                            <i class="fas fa-mars mr-1"></i>남성
                        </button>
                        <button onclick="setGenderFilter('여성')" 
                            class="filter-btn filter-btn-gender" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="여성">
                            <i class="fas fa-venus mr-1"></i>여성
                        </button>
                    </div>
                </div>

                <!-- 교급 필터 (버튼형) -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">
                        <i class="fas fa-graduation-cap mr-1"></i>교급
                    </label>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        <button onclick="setGradeFilter('')" 
                            class="filter-btn filter-btn-grade active" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="">
                            <i class="fas fa-list mr-1"></i>전체
                        </button>
                        <button onclick="setGradeFilter('유아')" 
                            class="filter-btn filter-btn-grade" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="유아">
                            <i class="fas fa-baby mr-1"></i>유아
                        </button>
                        <button onclick="setGradeFilter('초등')" 
                            class="filter-btn filter-btn-grade" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="초등">
                            <i class="fas fa-child mr-1"></i>초등
                        </button>
                        <button onclick="setGradeFilter('중등')" 
                            class="filter-btn filter-btn-grade" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="중등">
                            <i class="fas fa-user-graduate mr-1"></i>중등
                        </button>
                        <button onclick="setGradeFilter('고등')" 
                            class="filter-btn filter-btn-grade" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="고등">
                            <i class="fas fa-user-tie mr-1"></i>고등
                        </button>
                        <button onclick="setGradeFilter('성인')" 
                            class="filter-btn filter-btn-grade" style="padding: 0.5rem 1rem; border-radius: 24px; font-size: 0.875rem; font-weight: 600; transition: all 0.2s ease; min-height: 44px;"
                            data-value="성인">
                            <i class="fas fa-user mr-1"></i>성인
                        </button>
                    </div>
                </div>

                <!-- 부스 필터 (드롭다운 유지 - 많은 옵션) -->
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">
                        <i class="fas fa-store mr-1"></i>부스
                    </label>
                    <select id="filterBooth" 
                        style="width: 100%; padding: 0.5rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'"
                        onchange="filterParticipants()">
                        <option value="">전체</option>
                        <!-- 동적으로 부스 목록이 추가됩니다 -->
                    </select>
                </div>

                <!-- 필터 결과 및 초기화 -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.875rem; color: #6E6E73; font-weight: 600;">
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

            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); overflow: hidden; backdrop-filter: blur(20px);">
                <table class="mobile-card-view" style="width: 100%;">
                    <thead style="background: #F5F5F7; border-bottom: 2px solid #E5E5E7;">
                        <tr>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">이름</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">성별</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">교급</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">부스</th>
                            <th style="padding: 1rem 1.5rem; text-align: left; font-size: 0.875rem; font-weight: 700; color: #1D1D1F;">등록일시</th>
                        </tr>
                    </thead>
                    <tbody id="participantsTableBody" class="divide-y">
                        <tr>
                            <td colspan="5" style="padding: 2rem 1.5rem; text-align: center; color: #6E6E73;">
                                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                                <p>데이터 로딩 중...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- 행사 생성 모달 -->
    <div id="eventModal" class="modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: none; align-items: center; justify-content: center; z-index: 50;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); padding: 2rem; max-width: 28rem; width: 100%; margin: 0 1rem;">
            <h3 style="font-size: 1.5rem; font-weight: 800; color: #1D1D1F; margin-bottom: 1.5rem; letter-spacing: -0.5px;">새 행사 추가</h3>
            <form id="eventForm" style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">행사명</label>
                    <input type="text" id="eventName" required
                        style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'">
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">시작일</label>
                    <input type="date" id="eventStartDate" required
                        style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'">
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">종료일</label>
                    <input type="date" id="eventEndDate" required
                        style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'">
                </div>
                <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                    <button type="button" onclick="closeEventModal()"
                        style="flex: 1; background: #F5F5F7; color: #1D1D1F; padding: 0.75rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px;" onmouseover="this.style.background='#E5E5E7'" onmouseout="this.style.background='#F5F5F7'">
                        취소
                    </button>
                    <button type="submit"
                        style="flex: 1; background: linear-gradient(135deg, #5856D6 0%, #4F46E5 100%); color: white; padding: 0.75rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(88, 86, 214, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #5856D6 0%, #4F46E5 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(88, 86, 214, 0.3)'">
                        생성
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 부스 생성 모달 -->
    <div id="boothModal" class="modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: none; align-items: center; justify-content: center; z-index: 50;">
        <div style="background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); padding: 2rem; max-width: 28rem; width: 100%; margin: 0 1rem;">
            <h3 style="font-size: 1.5rem; font-weight: 800; color: #1D1D1F; margin-bottom: 1.5rem; letter-spacing: -0.5px;">새 부스 추가</h3>
            <form id="boothForm" style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">행사 선택</label>
                    <select id="boothEventId" required
                        style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'">
                        <option value="">행사를 선택하세요</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">부스명</label>
                    <input type="text" id="boothName" required
                        style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'">
                </div>
                <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #1D1D1F; margin-bottom: 0.5rem;">설명 (선택)</label>
                    <textarea id="boothDescription" rows="3"
                        style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #E5E5E7; border-radius: 12px; background: white; color: #1D1D1F; transition: all 0.2s ease;" onfocus="this.style.borderColor='#007AFF'; this.style.boxShadow='0 0 0 3px rgba(0, 122, 255, 0.1)'" onblur="this.style.borderColor='#E5E5E7'; this.style.boxShadow='none'"></textarea>
                </div>
                <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                    <button type="button" onclick="closeBoothModal()"
                        style="flex: 1; background: #F5F5F7; color: #1D1D1F; padding: 0.75rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px;" onmouseover="this.style.background='#E5E5E7'" onmouseout="this.style.background='#F5F5F7'">
                        취소
                    </button>
                    <button type="submit"
                        style="flex: 1; background: linear-gradient(135deg, #5856D6 0%, #4F46E5 100%); color: white; padding: 0.75rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease; min-height: 44px; box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);" onmouseover="this.style.background='linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(88, 86, 214, 0.4)'" onmouseout="this.style.background='linear-gradient(135deg, #5856D6 0%, #4F46E5 100%)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(88, 86, 214, 0.3)'">
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
            <div style="display: flex; align-items: center; justify-content: space-between; color: white; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1;">
                    <i class="fas fa-chart-line" style="font-size: 1.5rem;"></i>
                    <div style="min-width: 0;">
                        <h2 style="font-size: 1.25rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.5px;">통계 대시보드</h2>
                        <p style="font-size: 0.875rem; opacity: 0.8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="chartModeEventName">전체 행사</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                    <div style="font-size: 0.875rem; opacity: 0.8; display: flex; align-items: center;">
                        <i class="fas fa-sync-alt" style="margin-right: 0.25rem;"></i>
                        <span id="chartModeUpdateTime">--:--</span>
                    </div>
                    <button onclick="exitChartMode()" 
                        style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.2); border-radius: 12px; transition: all 0.2s ease; font-size: 0.9375rem; color: white; border: none; cursor: pointer; min-height: 44px;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        <i class="fas fa-times"></i>
                        <span style="display: inline;">닫기 (ESC)</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 차트 콘텐츠 -->
        <div class="chart-mode-content">
            <!-- 요약 카드 (더 컴팩트하게) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-bottom: 0.75rem;">
                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 0.75rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <i class="fas fa-users" style="font-size: 1.5rem; color: #007AFF;"></i>
                        <span style="font-size: 1.5rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="chartModeTotalParticipants">0</span>
                    </div>
                    <h3 style="color: #6E6E73; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">총 참가자</h3>
                </div>

                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 0.75rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <i class="fas fa-calendar" style="font-size: 1.5rem; color: #5856D6;"></i>
                        <span style="font-size: 1.5rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="chartModeTotalEvents">0</span>
                    </div>
                    <h3 style="color: #6E6E73; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">진행 중인 행사</h3>
                </div>

                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 0.75rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <i class="fas fa-store" style="font-size: 1.5rem; color: #FF375F;"></i>
                        <span style="font-size: 1.5rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="chartModeTotalBooths">0</span>
                    </div>
                    <h3 style="color: #6E6E73; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">활성 부스</h3>
                </div>

                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 0.75rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <i class="fas fa-chart-pie" style="font-size: 1.5rem; color: #32D74B;"></i>
                        <span style="font-size: 1.125rem; font-weight: 800; color: #1D1D1F; letter-spacing: -0.5px;" id="chartModeGenderRatio">50% / 50%</span>
                    </div>
                    <h3 style="color: #6E6E73; font-size: 0.75rem; font-weight: 600; margin-top: 0.25rem;">남성 / 여성 비율</h3>
                </div>
            </div>

            <!-- 차트 그리드 (더 작은 높이와 패딩) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem;">
                <!-- 성별 분포 -->
                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 1rem;">
                    <h3 style="font-size: 1rem; font-weight: 700; color: #1D1D1F; margin-bottom: 0.5rem; letter-spacing: -0.5px;">
                        <i class="fas fa-venus-mars" style="color: #FF375F; margin-right: 0.25rem;"></i>
                        성별 분포
                    </h3>
                    <div style="height: 160px;">
                        <canvas id="chartModeGenderChart"></canvas>
                    </div>
                    <!-- 성별 통계 테이블 (더 컴팩트하게) -->
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #E5E5E7;">
                        <div id="chartModeGenderStatsTable" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; text-align: center; font-size: 0.75rem;"></div>
                    </div>
                </div>

                <!-- 교급 분포 -->
                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 1rem;">
                    <h3 style="font-size: 1rem; font-weight: 700; color: #1D1D1F; margin-bottom: 0.5rem; letter-spacing: -0.5px;">
                        <i class="fas fa-graduation-cap" style="color: #007AFF; margin-right: 0.25rem;"></i>
                        교급 분포
                    </h3>
                    <div style="height: 160px;">
                        <canvas id="chartModeGradeChart"></canvas>
                    </div>
                    <!-- 교급 통계 테이블 (더 컴팩트하게) -->
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #E5E5E7;">
                        <div id="chartModeGradeStatsTable" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.25rem; text-align: center; font-size: 0.75rem;"></div>
                    </div>
                </div>
            </div>

            <!-- 부스별 참가자 현황 (더 작은 높이) -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 1rem;">
                <h3 style="font-size: 1rem; font-weight: 700; color: #1D1D1F; margin-bottom: 0.5rem; letter-spacing: -0.5px;">
                    <i class="fas fa-store-alt" style="color: #5856D6; margin-right: 0.25rem;"></i>
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
            <div style="display: flex; align-items: center; justify-content: space-between; color: white; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1;">
                    <i class="fas fa-th-large" style="font-size: 1.5rem;"></i>
                    <div style="min-width: 0;">
                        <h2 style="font-size: 1.25rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.5px;">실적 대시보드</h2>
                        <p style="font-size: 0.875rem; opacity: 0.8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="cardModeEventName">전체 행사</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                    <!-- 정렬 토글 -->
                    <select id="cardModeSortOrder" onchange="updateCardMode()"
                        style="padding: 0.5rem 0.75rem; background: rgba(255, 255, 255, 0.2); color: white; border-radius: 12px; font-size: 0.875rem; border: none; outline: none; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        <option value="count" style="color: #1D1D1F;">많은 순</option>
                        <option value="date" style="color: #1D1D1F;">일자 순</option>
                    </select>
                    <div style="font-size: 0.875rem; opacity: 0.8; display: flex; align-items: center;">
                        <i class="fas fa-sync-alt" style="margin-right: 0.25rem;"></i>
                        <span id="cardModeUpdateTime">--:--</span>
                    </div>
                    <button onclick="exitCardMode()" 
                        style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.2); border-radius: 12px; transition: all 0.2s ease; font-size: 0.9375rem; color: white; border: none; cursor: pointer; min-height: 44px;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        <i class="fas fa-times"></i>
                        <span style="display: inline;">닫기 (ESC)</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 카드 콘텐츠 -->
        <div class="chart-mode-content">
            <!-- 요약 정보 -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); padding: 1.5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1.5rem;">
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #5856D6; letter-spacing: -1px;" id="cardModeTotalParticipants">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">총 참가자</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #AF52DE; letter-spacing: -1px;" id="cardModeTotalEvents">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">진행 행사</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #FF375F; letter-spacing: -1px;" id="cardModeTotalBooths">0</div>
                            <div style="font-size: 0.875rem; color: #6E6E73; margin-top: 0.25rem; font-weight: 600;">활성 부스</div>
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; color: #6E6E73; font-weight: 600;">
                        <i class="fas fa-info-circle" style="margin-right: 0.25rem;"></i>
                        <span id="cardModeDescription">카드를 클릭하여 상세 정보를 확인하세요</span>
                    </div>
                </div>
            </div>

            <!-- 카드 그리드 -->
            <div id="cardModeGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                <!-- 카드들이 동적으로 추가됩니다 -->
            </div>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script src="/static/js/admin-dashboard.js"></script>
</body>
</html>
`
