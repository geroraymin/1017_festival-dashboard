/**
 * 운영자 대시보드 페이지 - Apple HIG
 */

export const operatorDashboardPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>운영자 대시보드 - 축제 디지털방명록 시스템</title>
    <link rel="stylesheet" href="/static/style.css">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        /* 스켈레톤 로더 애니메이션 */
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
        .skeleton-title {
            height: 2rem;
            width: 60%;
            margin-bottom: 1rem;
        }
        .skeleton-card {
            height: 120px;
        }
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #14b8a6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body style="background: linear-gradient(135deg, #F5F7FA 0%, #E3F2FD 100%); min-height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;">
    <!-- 헤더 -->
    <header style="background: rgba(255, 255, 255, 0.95); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); backdrop-filter: blur(20px);">
        <div style="max-width: 1280px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="padding: 0.625rem; background: linear-gradient(135deg, #007AFF, #0051D5); border-radius: 12px; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-store" style="color: white; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <h1 style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0; letter-spacing: -0.3px;">운영자 대시보드</h1>
                    <p style="font-size: 0.875rem; color: #6E6E73; margin: 0.25rem 0 0 0;" id="boothName">부스명 로딩 중...</p>
                </div>
            </div>
            <button onclick="logout()" class="btn" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: linear-gradient(135deg, #FF375F, #D32F2F); color: white; border: none; border-radius: 12px; cursor: pointer; min-height: 44px; font-weight: 600; font-size: 1rem; transition: all 0.2s ease;">
                <i class="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
            </button>
        </div>
    </header>

    <main style="max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem;">
        <!-- 부스 정보 카드 -->
        <div class="card" style="background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%); border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3); padding: 2rem; margin-bottom: 2rem; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
                <div style="flex: 1; min-width: 250px;">
                    <h2 class="text-title1" style="font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; letter-spacing: -0.5px;" id="boothNameLarge">부스명</h2>
                    <p style="font-size: 1rem; color: rgba(255, 255, 255, 0.85); margin: 0 0 1.5rem 0; font-weight: 500;" id="eventName">행사명</p>
                    <div style="display: inline-flex; align-items: center; gap: 0.75rem; background: rgba(255, 255, 255, 0.2); padding: 0.875rem 1.25rem; border-radius: 12px; backdrop-filter: blur(10px);">
                        <i class="fas fa-key" style="font-size: 1.125rem;"></i>
                        <span style="font-family: 'SF Mono', Monaco, monospace; font-weight: 700; font-size: 1.125rem; letter-spacing: 1px;" id="boothCode">------</span>
                    </div>
                </div>
                <div style="text-align: right; min-width: 200px;">
                    <div style="display: flex; align-items: baseline; justify-content: flex-end; gap: 1rem; margin-bottom: 0.75rem;">
                        <div>
                            <div style="font-size: 3.5rem; font-weight: 800; line-height: 1; letter-spacing: -2px;" id="totalParticipants">0</div>
                            <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.85); margin-top: 0.25rem; font-weight: 500;">연인원</div>
                        </div>
                        <div style="font-size: 2rem; color: rgba(255, 255, 255, 0.5); font-weight: 300;">/</div>
                        <div>
                            <div style="font-size: 2rem; font-weight: 700; line-height: 1; letter-spacing: -1px;" id="uniqueParticipants">0</div>
                            <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.85); margin-top: 0.25rem; font-weight: 500;">실인원</div>
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.85); font-weight: 500;">
                        <span id="duplicateVisits">0</span>명 중복 방문
                    </div>
                </div>
            </div>
        </div>

        <!-- 대기열 관리 섹션 -->
        <div class="card" style="background: linear-gradient(135deg, #FF9F0A 0%, #FF375F 100%); border-radius: 16px; box-shadow: 0 8px 24px rgba(255, 159, 10, 0.3); padding: 1.5rem; margin-bottom: 2rem; color: white;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem 0; letter-spacing: -0.3px;">
                        <i class="fas fa-users-line" style="margin-right: 0.75rem;"></i>
                        대기열 관리
                    </h2>
                    <p style="font-size: 0.9375rem; color: rgba(255, 255, 255, 0.85); margin: 0; font-weight: 500;">현재 대기 중인 손님을 관리하세요</p>
                </div>
                <button onclick="refreshQueue()" class="btn" style="padding: 0.75rem 1.25rem; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 12px; cursor: pointer; color: white; font-weight: 600; min-height: 44px; transition: all 0.2s ease; backdrop-filter: blur(10px);">
                    <i class="fas fa-sync-alt" style="margin-right: 0.5rem;"></i>새로고침
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(10px);">
                    <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.85); margin-bottom: 0.5rem; font-weight: 500;">현재 진행 번호</div>
                    <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -1px;" id="currentQueueNumber">-</div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(10px);">
                    <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.85); margin-bottom: 0.5rem; font-weight: 500;">마지막 발급 번호</div>
                    <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -1px;" id="lastQueueNumber">-</div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(10px);">
                    <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.85); margin-bottom: 0.5rem; font-weight: 500;">대기 인원</div>
                    <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -1px;" id="waitingCount">-</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button onclick="callNextGuest()" class="btn btn-primary" 
                    style="flex: 1; min-width: 200px; background: white; color: #FF9F0A; font-weight: 700; padding: 1.25rem 1.5rem; border-radius: 12px; border: none; cursor: pointer; min-height: 44px; font-size: 1.0625rem; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                    <i class="fas fa-bell" style="margin-right: 0.75rem;"></i>
                    다음 손님 호출
                </button>
                <button onclick="openQueueDisplay()" class="btn"
                    style="padding: 1.25rem 1.5rem; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 12px; cursor: pointer; color: white; font-weight: 600; min-height: 44px; font-size: 1rem; transition: all 0.2s ease; backdrop-filter: blur(10px);">
                    <i class="fas fa-tv" style="margin-right: 0.5rem;"></i>
                    대기 화면 보기
                </button>
            </div>
        </div>

        <!-- 액션 버튼 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <a href="#" onclick="openGuestbook(); return false;" class="card"
                style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; text-decoration: none; transition: all 0.2s ease; backdrop-filter: blur(20px);">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.2px;">
                        <i class="fas fa-pen-fancy" style="color: #007AFF; margin-right: 0.75rem;"></i>
                        방명록 작성
                    </h3>
                    <p style="font-size: 0.9375rem; color: #6E6E73; margin: 0;">참가자 정보 등록하기</p>
                </div>
                <i class="fas fa-chevron-right" style="font-size: 1.5rem; color: #C7C7CC;"></i>
            </a>

            <button onclick="exportBoothCSV()" class="card"
                style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border: none; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(20px); text-align: left;">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.2px;">
                        <i class="fas fa-file-csv" style="color: #32D74B; margin-right: 0.75rem;"></i>
                        CSV 다운로드
                    </h3>
                    <p style="font-size: 0.9375rem; color: #6E6E73; margin: 0;">참가자 명단 저장</p>
                </div>
                <i class="fas fa-chevron-right" style="font-size: 1.5rem; color: #C7C7CC;"></i>
            </button>

            <button onclick="sendCSVEmail()" class="card"
                style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border: none; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(20px); text-align: left;">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.2px;">
                        <i class="fas fa-envelope" style="color: #007AFF; margin-right: 0.75rem;"></i>
                        이메일로 받기
                    </h3>
                    <p style="font-size: 0.9375rem; color: #6E6E73; margin: 0;">CSV를 이메일로 전송</p>
                </div>
                <i class="fas fa-chevron-right" style="font-size: 1.5rem; color: #C7C7CC;"></i>
            </button>

            <button onclick="openDisplayMode()" class="card"
                style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border: none; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(20px); text-align: left;">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.2px;">
                        <i class="fas fa-tv" style="color: #5856D6; margin-right: 0.75rem;"></i>
                        디스플레이 모드
                    </h3>
                    <p style="font-size: 0.9375rem; color: #6E6E73; margin: 0;">통계 크게 보기</p>
                </div>
                <i class="fas fa-chevron-right" style="font-size: 1.5rem; color: #C7C7CC;"></i>
            </button>

            <button id="refreshButton" onclick="refreshStats()" class="card"
                style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border: none; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(20px); text-align: left;">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.2px;">
                        <i id="refreshIcon" class="fas fa-sync-alt" style="color: #007AFF; margin-right: 0.75rem;"></i>
                        <span id="refreshText">통계 새로고침</span>
                    </h3>
                    <p style="font-size: 0.9375rem; color: #6E6E73; margin: 0;">최신 데이터 불러오기</p>
                </div>
                <i class="fas fa-chevron-right" style="font-size: 1.5rem; color: #C7C7CC;"></i>
            </button>

            <button onclick="resetParticipants()" class="card"
                style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border: none; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(20px); text-align: left;">
                <div>
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin: 0 0 0.5rem 0; letter-spacing: -0.2px;">
                        <i class="fas fa-trash-alt" style="color: #FF375F; margin-right: 0.75rem;"></i>
                        명단 초기화
                    </h3>
                    <p style="font-size: 0.9375rem; color: #6E6E73; margin: 0;">참가자 명단 삭제</p>
                </div>
                <i class="fas fa-chevron-right" style="font-size: 1.5rem; color: #C7C7CC;"></i>
            </button>
        </div>

        <!-- 통계 카드 -->
        <!-- 성별 카드 -->
        <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin-bottom: 1rem; letter-spacing: -0.2px;">
                <i class="fas fa-venus-mars" style="color: #007AFF; margin-right: 0.75rem;"></i>
                성별 분포
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-mars" style="font-size: 2rem; color: #007AFF;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="maleCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">남성</h3>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-venus" style="font-size: 2rem; color: #FF375F;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="femaleCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">여성</h3>
                </div>
            </div>
        </div>

        <!-- 교급 카드 -->
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #1D1D1F; margin-bottom: 1rem; letter-spacing: -0.2px;">
                <i class="fas fa-graduation-cap" style="color: #5856D6; margin-right: 0.75rem;"></i>
                교급 분포
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;" id="statsCards">
                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-baby" style="font-size: 2rem; color: #FFD60A;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="infantCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">유아</h3>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-child" style="font-size: 2rem; color: #32D74B;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="elementaryCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">초등</h3>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-user-graduate" style="font-size: 2rem; color: #007AFF;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="middleCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">중등</h3>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-user-tie" style="font-size: 2rem; color: #5856D6;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="highCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">고등</h3>
                </div>

                <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <i class="fas fa-user" style="font-size: 2rem; color: #FF375F;"></i>
                        <span style="font-size: 2rem; font-weight: 800; color: #1D1D1F; letter-spacing: -1px;" id="adultCount">0</span>
                    </div>
                    <h3 style="font-size: 1rem; color: #6E6E73; font-weight: 600; margin: 0;">성인</h3>
                </div>
            </div>
        </div>

        <!-- 로딩 스켈레톤 (초기 상태) -->
        <div style="display: none;" id="statsCardsLoading">
            <!-- 성별 로딩 -->
            <div style="margin-bottom: 1.5rem;">
                <div class="skeleton skeleton-text" style="width: 8rem; margin-bottom: 0.75rem;"></div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                </div>
            </div>
            
            <!-- 교급 로딩 -->
            <div style="margin-bottom: 2rem;">
                <div class="skeleton skeleton-text" style="width: 8rem; margin-bottom: 0.75rem;"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                        <div class="skeleton skeleton-card"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 차트 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <!-- 성별 분포 차트 -->
            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                <h3 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0 0 1rem 0; letter-spacing: -0.5px;">
                    <i class="fas fa-chart-pie" style="color: #007AFF; margin-right: 0.5rem;"></i>
                    성별 분포
                </h3>
                <canvas id="genderChart"></canvas>
            </div>

            <!-- 교급 분포 차트 -->
            <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
                <h3 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0 0 1rem 0; letter-spacing: -0.5px;">
                    <i class="fas fa-chart-bar" style="color: #5856D6; margin-right: 0.5rem;"></i>
                    교급 분포
                </h3>
                <canvas id="gradeChart"></canvas>
            </div>
        </div>

        <!-- 시간대별 참가자 차트 -->
        <div class="card" style="background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); padding: 1.5rem; backdrop-filter: blur(20px);">
            <h3 class="text-title3" style="font-size: 1.25rem; font-weight: 700; color: #1D1D1F; margin: 0 0 1rem 0; letter-spacing: -0.5px;">
                <i class="fas fa-chart-line" style="color: #007AFF; margin-right: 0.5rem;"></i>
                시간대별 참가자
            </h3>
            <canvas id="timeChart"></canvas>
        </div>
    </main>

    <script src="/static/js/api.js"></script>
    <script>
        let genderChart, gradeChart, timeChart
        let boothId

        // 인증 확인
        const user = getUser()
        if (!user || user.role !== 'operator') {
            alert('운영자 권한이 필요합니다.')
            window.location.href = '/operator'
        }

        boothId = user.booth_id

        // 로그아웃
        function logout() {
            if (confirm('로그아웃하시겠습니까?')) {
                clearToken()
                window.location.href = '/'
            }
        }

        // 방명록 페이지 열기
        function openGuestbook() {
            window.open(\`/guestbook?booth_id=\${boothId}\`, '_blank')
        }

        // 디스플레이 모드 열기
        function openDisplayMode() {
            window.open(\`/display?booth_id=\${boothId}\`, '_blank', 'width=1920,height=1080')
        }

        // 부스 정보 로드
        async function loadBoothInfo() {
            try {
                const response = await BoothsAPI.getOne(boothId)
                const booth = response.booth

                document.getElementById('boothName').textContent = booth.name
                document.getElementById('boothNameLarge').textContent = booth.name
                document.getElementById('boothCode').textContent = booth.booth_code
                
                if (booth.events) {
                    document.getElementById('eventName').textContent = booth.events.name
                }
                
                // 대기열 시스템에 부스 ID 전달
                if (typeof setBoothIdForQueue === 'function') {
                    setBoothIdForQueue(boothId)
                }
            } catch (error) {
                console.error('부스 정보 로드 실패:', error)
            }
        }

        // 로딩 상태 토글
        function showLoading() {
            document.getElementById('statsCards').parentElement.style.display = 'none'
            document.getElementById('statsCardsLoading').style.display = 'block'
        }

        function hideLoading() {
            document.getElementById('statsCards').parentElement.style.display = 'block'
            document.getElementById('statsCardsLoading').style.display = 'none'
        }

        // 새로고침 버튼 클릭 핸들러
        async function refreshStats() {
            const refreshButton = document.getElementById('refreshButton')
            const refreshIcon = document.getElementById('refreshIcon')
            const refreshText = document.getElementById('refreshText')
            
            // 버튼 비활성화 및 로딩 표시
            refreshButton.disabled = true
            refreshIcon.classList.add('fa-spin')
            refreshText.textContent = '새로고침 중...'
            
            await loadStats()
            
            // 버튼 활성화 및 원래 상태로
            refreshButton.disabled = false
            refreshIcon.classList.remove('fa-spin')
            refreshText.textContent = '통계 새로고침'
        }

        // 참가자 명단 초기화
        async function resetParticipants() {
            const confirmed = confirm('정말로 참가자 명단을 초기화하시겠습니까?\\n\\n이 작업은 되돌릴 수 없으며, 다음 내용이 삭제됩니다:\\n- 모든 참가자 정보\\n- 대기열 정보\\n\\n통계 데이터는 실시간으로 0으로 초기화됩니다.')
            
            if (!confirmed) return
            
            const doubleCheck = confirm('최종 확인\\n\\n참가자 명단을 정말로 삭제하시겠습니까?\\n이 작업은 되돌릴 수 없습니다!')
            
            if (!doubleCheck) return
            
            try {
                const response = await ParticipantsAPI.reset()
                alert(response.message + '\\n삭제된 항목: ' + response.deleted_count + '개')
                
                // 통계 새로고침
                await loadStats()
            } catch (error) {
                console.error('명단 초기화 실패:', error)
                alert('명단 초기화에 실패했습니다.\\n' + (error.message || '알 수 없는 오류'))
            }
        }

        // 통계 로드
        async function loadStats() {
            showLoading()
            try {
                const response = await StatsAPI.getBooth(boothId)
                const stats = response.stats

                // 연인원 (총 방문 수)
                document.getElementById('totalParticipants').textContent = stats.total_participants
                
                // 실인원 (고유 참가자)
                document.getElementById('uniqueParticipants').textContent = stats.unique_participants || stats.total_participants
                
                // 중복 방문 수
                document.getElementById('duplicateVisits').textContent = stats.duplicate_visits || 0

                // 성별 통계
                document.getElementById('maleCount').textContent = stats.gender_distribution['남성'] || 0
                document.getElementById('femaleCount').textContent = stats.gender_distribution['여성'] || 0

                // 교급 통계 (모든 학년)
                document.getElementById('infantCount').textContent = stats.grade_distribution['유아'] || 0
                document.getElementById('elementaryCount').textContent = stats.grade_distribution['초등'] || 0
                document.getElementById('middleCount').textContent = stats.grade_distribution['중등'] || 0
                document.getElementById('highCount').textContent = stats.grade_distribution['고등'] || 0
                document.getElementById('adultCount').textContent = stats.grade_distribution['성인'] || 0

                // 차트 업데이트
                updateGenderChart(stats.gender_distribution)
                updateGradeChart(stats.grade_distribution)
                updateTimeChart(stats.hourly_distribution)
                
                hideLoading()
            } catch (error) {
                console.error('통계 로드 실패:', error)
                hideLoading()
                alert('통계 데이터를 불러오는데 실패했습니다.')
            }
        }

        // 성별 분포 차트
        function updateGenderChart(data) {
            const ctx = document.getElementById('genderChart').getContext('2d')
            
            if (genderChart) {
                genderChart.destroy()
            }

            genderChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['남성', '여성'],
                    datasets: [{
                        data: [data['남성'] || 0, data['여성'] || 0],
                        backgroundColor: ['#007AFF', '#FF375F']
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

        // 교급 분포 차트
        function updateGradeChart(data) {
            const ctx = document.getElementById('gradeChart').getContext('2d')
            
            if (gradeChart) {
                gradeChart.destroy()
            }

            gradeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['유아', '초등', '중등', '고등', '성인'],
                    datasets: [{
                        label: '참가자 수',
                        data: [
                            data['유아'] || 0,
                            data['초등'] || 0,
                            data['중등'] || 0,
                            data['고등'] || 0,
                            data['성인'] || 0
                        ],
                        backgroundColor: ['#FFD60A', '#32D74B', '#007AFF', '#5856D6', '#FF375F']
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

        // 시간대별 참가자 차트
        function updateTimeChart(data) {
            const ctx = document.getElementById('timeChart').getContext('2d')
            
            if (timeChart) {
                timeChart.destroy()
            }

            // 시간대 데이터 정렬
            const hours = Object.keys(data).sort()
            const counts = hours.map(h => data[h])

            timeChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: hours,
                    datasets: [{
                        label: '참가자 수',
                        data: counts,
                        borderColor: '#007AFF',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        tension: 0.4,
                        fill: true
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

        // CSV 내보내기 (부스 운영자용)
        async function exportBoothCSV() {
            try {
                // 해당 부스의 참가자 데이터 가져오기 (서버에서 이미 필터링됨)
                const response = await ParticipantsAPI.getAll()
                const boothParticipants = response.participants || []
                
                console.log('CSV Export - boothId:', boothId)
                console.log('CSV Export - participants:', boothParticipants.length)
                console.log('CSV Export - first participant:', boothParticipants[0])
                
                if (boothParticipants.length === 0) {
                    alert('내보낼 참가자 데이터가 없습니다.')
                    return
                }
                
                // CSV 헤더 (UTF-8 BOM 추가 + 중복방문 컬럼)
                let csv = '\\uFEFF이름,성별,교급,생년월일,등록일시,방문형태\\n'
                
                // CSV 데이터 (부스명 제외 - 자신의 부스니까 불필요)
                boothParticipants.forEach(p => {
                    // created_at_kst가 있으면 사용, 없으면 created_at 사용 (UTC이므로 +9시간 필요)
                    const timestamp = p.created_at_kst || p.created_at
                    const createdAt = new Date(timestamp).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })
                    const visitType = p.is_duplicate === 1 ? '재방문' : '첫방문'
                    csv += \`\${p.name},\${p.gender},\${p.grade},\${p.date_of_birth},\${createdAt},\${visitType}\\n\`
                })
                
                // 다운로드
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                
                // 파일명: booth_부스명_날짜.csv
                const boothName = document.getElementById('boothNameLarge').textContent
                const filename = \`booth_\${boothName}_\${new Date().toISOString().split('T')[0]}.csv\`
                link.setAttribute('download', filename)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                alert(\`\${boothParticipants.length}명의 참가자 데이터를 내보냈습니다.\`)
            } catch (error) {
                console.error('CSV 내보내기 실패:', error)
                alert('CSV 다운로드에 실패했습니다: ' + error.message)
            }
        }

        // 이메일로 CSV 전송
        async function sendCSVEmail() {
            // 이메일 주소 입력 받기
            const email = prompt('CSV를 받을 이메일 주소를 입력하세요:')
            
            console.log('📧 이메일 전송 시작 - 입력된 이메일:', email)
            
            if (!email) {
                console.log('📧 이메일 전송 취소됨')
                return // 취소한 경우
            }
            
            // 간단한 이메일 형식 검증
            if (!email.includes('@') || !email.includes('.')) {
                console.error('📧 이메일 형식 오류:', email)
                alert('유효한 이메일 주소를 입력해주세요.')
                return
            }
            
            try {
                console.log('📧 EmailAPI.sendCSV 호출 중...')
                const response = await EmailAPI.sendCSV(email)
                console.log('📧 이메일 전송 성공:', response)
                alert(response.message || '이메일이 전송되었습니다!')
            } catch (error) {
                console.error('📧 이메일 전송 실패 (catch):', error)
                console.error('📧 에러 상세:', error.message, error.stack)
                alert('이메일 전송에 실패했습니다: ' + error.message)
            }
        }

        // 초기 로드
        loadBoothInfo()
        loadStats()

        // 10초마다 자동 새로고침
        setInterval(loadStats, 10000)
    </script>
    
    <!-- 대기열 관리 스크립트 -->
    <script src="/static/js/operator-queue.js"></script>
</body>
</html>
`
