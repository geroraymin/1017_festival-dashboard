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

        body.operator-page {
            background: #F4F6F8;
            min-height: 100vh;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
        }

        .operator-header {
            background: rgba(255, 255, 255, 0.96);
            border-bottom: 1px solid #E5E7EB;
            position: sticky;
            top: 0;
            z-index: 40;
            backdrop-filter: blur(16px);
        }

        .operator-shell {
            max-width: 1180px;
            margin: 0 auto;
            padding: 1.25rem;
        }

        .operator-header-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }

        .operator-title-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 0;
        }

        .operator-app-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #0A66D8;
            color: white;
            flex: 0 0 auto;
        }

        .operator-title {
            margin: 0;
            font-size: 1.125rem;
            line-height: 1.25;
            font-weight: 700;
            color: #111827;
            letter-spacing: 0;
        }

        .operator-subtitle {
            margin: 0.125rem 0 0;
            color: #6B7280;
            font-size: 0.875rem;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .operator-main {
            max-width: 1180px;
            margin: 0 auto;
            padding: 1.25rem;
        }

        .operator-hero {
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .operator-panel {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
            padding: 1.25rem;
        }

        .operator-panel-muted {
            background: #F9FAFB;
        }

        .operator-panel-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .operator-label {
            color: #6B7280;
            font-size: 0.8125rem;
            line-height: 1.2;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .operator-booth-name {
            margin: 0.25rem 0 0;
            color: #111827;
            font-size: 1.625rem;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: 0;
        }

        .operator-event-name {
            margin: 0.375rem 0 0;
            color: #4B5563;
            font-size: 1rem;
            line-height: 1.4;
        }

        .operator-code-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            background: #EEF6FF;
            color: #0A66D8;
            font-family: ui-monospace, 'SF Mono', Monaco, Consolas, monospace;
            font-weight: 800;
            letter-spacing: 0.08em;
            white-space: nowrap;
        }

        .operator-count-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.75rem;
        }

        .operator-count-card {
            min-height: 112px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 1rem;
            background: #FFFFFF;
        }

        .operator-count-value {
            margin-top: 0.5rem;
            color: #111827;
            font-size: 2.25rem;
            line-height: 1;
            font-weight: 800;
            letter-spacing: 0;
        }

        .operator-queue-panel {
            border-color: #F59E0B;
            background: #FFFBEB;
        }

        .operator-queue-value {
            color: #92400E;
        }

        .operator-primary-action {
            width: 100%;
            min-height: 60px;
            margin-top: 1rem;
            background: #0A66D8;
            color: white;
            border: 0;
            border-radius: 8px;
            font-size: 1.0625rem;
            font-weight: 800;
            cursor: pointer;
        }

        .operator-secondary-actions {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .operator-action {
            min-height: 56px;
            display: flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.75rem 0.875rem;
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            color: #111827;
            text-align: left;
            text-decoration: none;
            cursor: pointer;
        }

        .operator-action i {
            color: #0A66D8;
            width: 20px;
            text-align: center;
        }

        .operator-action-title {
            display: block;
            font-size: 0.875rem;
            line-height: 1.25;
            font-weight: 800;
        }

        .operator-action-caption {
            display: block;
            margin-top: 0.125rem;
            color: #6B7280;
            font-size: 0.75rem;
            line-height: 1.3;
        }

        .operator-utility-grid {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding: 0.875rem;
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
        }

        .operator-utility-title {
            margin: 0;
            color: #111827;
            font-size: 0.9375rem;
            font-weight: 800;
        }

        .operator-utility-caption {
            margin: 0.125rem 0 0;
            color: #6B7280;
            font-size: 0.8125rem;
        }

        .operator-utility-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 0.5rem;
        }

        .operator-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }

        .operator-tab-button {
            min-height: 44px;
            padding: 0.75rem 1rem;
            border: 0;
            border-bottom: 3px solid transparent;
            background: transparent;
            color: #6B7280;
            font-weight: 800;
            cursor: pointer;
        }

        .operator-tab-button.active {
            color: #0A66D8;
            border-bottom-color: #0A66D8;
        }

        .operator-tab-panel {
            display: none;
        }

        .operator-tab-panel.active {
            display: block;
        }

        .operator-filter-grid {
            display: grid;
            grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(150px, 0.6fr)) auto;
            gap: 0.75rem;
            align-items: end;
        }

        .operator-field label {
            display: block;
            margin-bottom: 0.375rem;
            color: #374151;
            font-size: 0.8125rem;
            font-weight: 800;
        }

        .operator-field input,
        .operator-field select {
            width: 100%;
            min-height: 42px;
            padding: 0.625rem 0.75rem;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            background: #FFFFFF;
            color: #111827;
            font-size: 0.9375rem;
            box-sizing: border-box;
        }

        .operator-table-wrap {
            overflow-x: auto;
        }

        .operator-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 920px;
        }

        .operator-table th,
        .operator-table td {
            padding: 0.875rem;
            border-bottom: 1px solid #E5E7EB;
            text-align: left;
            vertical-align: middle;
            font-size: 0.875rem;
        }

        .operator-table th {
            background: #F9FAFB;
            color: #374151;
            font-weight: 800;
        }

        .operator-inline-actions {
            display: flex;
            gap: 0.5rem;
        }

        .operator-status-pill {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.5rem;
            border-radius: 999px;
            background: #F3F4F6;
            color: #374151;
            font-size: 0.75rem;
            font-weight: 800;
        }

        .operator-modal {
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background: rgba(17, 24, 39, 0.55);
            z-index: 80;
        }

        .operator-modal.active {
            display: flex;
        }

        .operator-modal-card {
            width: 100%;
            max-width: 480px;
            background: #FFFFFF;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 20px 40px rgba(17, 24, 39, 0.2);
        }

        @media (max-width: 820px) {
            .operator-hero,
            .operator-secondary-actions,
            .operator-filter-grid {
                grid-template-columns: 1fr;
            }

            .operator-count-grid {
                grid-template-columns: repeat(3, minmax(88px, 1fr));
                overflow-x: auto;
            }

            .operator-header-inner {
                align-items: flex-start;
            }

            .operator-header .btn span {
                display: none;
            }

            .operator-utility-grid {
                align-items: stretch;
                flex-direction: column;
            }

            .operator-utility-actions {
                justify-content: stretch;
            }

            .operator-utility-actions .btn {
                flex: 1 1 auto;
            }
        }
    </style>
</head>
<body class="operator-page">
    <!-- 헤더 -->
    <header class="operator-header">
        <div class="operator-shell operator-header-inner">
            <div class="operator-title-row">
                <div class="operator-app-icon" aria-hidden="true">
                    <i class="fas fa-store"></i>
                </div>
                <div style="min-width: 0;">
                    <h1 class="operator-title">운영자 대시보드</h1>
                    <p class="operator-subtitle" id="boothName">부스명 로딩 중...</p>
                </div>
            </div>
            <button onclick="logout()" class="btn btn-danger">
                <i class="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
            </button>
        </div>
    </header>

    <main class="operator-main">
        <nav class="operator-tabs" aria-label="운영자 화면">
            <button type="button" class="operator-tab-button active" id="operatorOverviewTabButton" onclick="switchOperatorTab('overview')">
                <i class="fas fa-chart-line" style="margin-right: 0.375rem;"></i>현황
            </button>
            <button type="button" class="operator-tab-button" id="operatorParticipantsTabButton" onclick="switchOperatorTab('participants')">
                <i class="fas fa-users" style="margin-right: 0.375rem;"></i>참가자 관리
            </button>
        </nav>

        <section id="operatorOverviewTab" class="operator-tab-panel active">
        <section class="operator-hero" aria-label="부스 운영 현황">
            <div class="operator-panel">
                <div class="operator-panel-header">
                    <div>
                        <div class="operator-label">현재 부스</div>
                        <h2 class="operator-booth-name" id="boothNameLarge">부스명</h2>
                        <p class="operator-event-name" id="eventName">행사명</p>
                    </div>
                    <div class="operator-code-pill" title="부스 코드">
                        <i class="fas fa-key" aria-hidden="true"></i>
                        <span id="boothCode">------</span>
                    </div>
                </div>

                <div class="operator-count-grid">
                    <div class="operator-count-card">
                        <div class="operator-label">연인원</div>
                        <div class="operator-count-value" id="totalParticipants">0</div>
                    </div>
                    <div class="operator-count-card">
                        <div class="operator-label">실인원</div>
                        <div class="operator-count-value" id="uniqueParticipants">0</div>
                    </div>
                    <div class="operator-count-card">
                        <div class="operator-label">중복 방문</div>
                        <div class="operator-count-value"><span id="duplicateVisits">0</span></div>
                    </div>
                </div>
            </div>

            <div class="operator-panel operator-queue-panel">
                <div class="operator-panel-header">
                    <div>
                        <div class="operator-label">대기열</div>
                        <h2 class="operator-booth-name" style="font-size: 1.375rem;">호출 관리</h2>
                    </div>
                    <button onclick="refreshQueue()" class="btn btn-sm btn-secondary">
                        <i class="fas fa-sync-alt" style="margin-right: 0.375rem;"></i>새로고침
                    </button>
                </div>

                <div class="operator-count-grid">
                    <div class="operator-count-card">
                        <div class="operator-label">현재 번호</div>
                        <div class="operator-count-value operator-queue-value" id="currentQueueNumber">-</div>
                    </div>
                    <div class="operator-count-card">
                        <div class="operator-label">마지막 번호</div>
                        <div class="operator-count-value operator-queue-value" id="lastQueueNumber">-</div>
                    </div>
                    <div class="operator-count-card">
                        <div class="operator-label">대기 인원</div>
                        <div class="operator-count-value operator-queue-value" id="waitingCount">-</div>
                    </div>
                </div>

                <button onclick="callNextGuest()" class="operator-primary-action">
                    <i class="fas fa-bell" style="margin-right: 0.5rem;"></i>
                    다음 손님 호출
                </button>
            </div>
        </section>

        <section class="operator-secondary-actions" aria-label="주요 운영 작업">
            <a href="#" onclick="openGuestbook(); return false;" class="operator-action">
                <i class="fas fa-pen-fancy" aria-hidden="true"></i>
                <span>
                    <span class="operator-action-title">방명록 작성</span>
                    <span class="operator-action-caption">참가자 정보 등록</span>
                </span>
            </a>
            <button onclick="openQueueDisplay()" class="operator-action">
                <i class="fas fa-tv" aria-hidden="true"></i>
                <span>
                    <span class="operator-action-title">대기 화면</span>
                    <span class="operator-action-caption">외부 화면으로 표시</span>
                </span>
            </button>
            <button id="refreshButton" onclick="refreshStats()" class="operator-action">
                <i id="refreshIcon" class="fas fa-sync-alt" aria-hidden="true"></i>
                <span>
                    <span class="operator-action-title" id="refreshText">통계 새로고침</span>
                    <span class="operator-action-caption">최신 데이터 불러오기</span>
                </span>
            </button>
        </section>

        <!-- 액션 버튼 -->
        <section class="operator-utility-grid" aria-label="데이터 관리 작업">
            <div>
                <p class="operator-utility-title">운영 도구</p>
                <p class="operator-utility-caption">참가자 관리 탭에서 목록 확인과 개별 수정이 가능합니다.</p>
            </div>
            <div class="operator-utility-actions">
                <button onclick="exportBoothCSV()" class="btn btn-secondary">
                    <i class="fas fa-file-csv" style="margin-right: 0.375rem;"></i>CSV
                </button>
                <button onclick="sendCSVEmail()" class="btn btn-secondary">
                    <i class="fas fa-envelope" style="margin-right: 0.375rem;"></i>이메일
                </button>
                <button onclick="openDisplayMode()" class="btn btn-secondary">
                    <i class="fas fa-tv" style="margin-right: 0.375rem;"></i>디스플레이
                </button>
                <button onclick="resetParticipants()" class="btn btn-danger">
                    <i class="fas fa-trash-alt" style="margin-right: 0.375rem;"></i>초기화
                </button>
            </div>
        </section>

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
        </section>

        <section id="operatorParticipantsTab" class="operator-tab-panel">
            <div class="operator-panel">
                <div class="operator-panel-header">
                    <div>
                        <div class="operator-label">참가자 관리</div>
                        <h2 class="operator-booth-name" style="font-size: 1.5rem;">부스 참가자 목록</h2>
                    </div>
                    <button onclick="exportBoothCSV()" class="btn btn-primary">
                        <i class="fas fa-file-csv" style="margin-right: 0.375rem;"></i>CSV 다운로드
                    </button>
                </div>

                <div class="operator-filter-grid" style="margin-bottom: 1rem;">
                    <div class="operator-field">
                        <label for="participantSearch">이름 검색</label>
                        <input id="participantSearch" type="search" placeholder="이름 입력" oninput="filterOperatorParticipants()">
                    </div>
                    <div class="operator-field">
                        <label for="participantDate">등록일</label>
                        <input id="participantDate" type="date" onchange="loadOperatorParticipants()">
                    </div>
                    <div class="operator-field">
                        <label for="participantAttendanceFilter">참석</label>
                        <select id="participantAttendanceFilter" onchange="filterOperatorParticipants()">
                            <option value="">전체</option>
                            <option value="1">참석</option>
                            <option value="0">미확인</option>
                        </select>
                    </div>
                    <div class="operator-field">
                        <label for="participantVisitFilter">방문형태</label>
                        <select id="participantVisitFilter" onchange="filterOperatorParticipants()">
                            <option value="">전체</option>
                            <option value="first">첫방문</option>
                            <option value="same_booth">같은 부스 재방문</option>
                            <option value="same_event_other_booth">행사 내 타부스 방문</option>
                            <option value="other_event">다른 행사 방문자</option>
                        </select>
                    </div>
                    <button onclick="resetOperatorParticipantFilters()" class="btn btn-secondary" style="min-height: 42px;">
                        <i class="fas fa-redo" style="margin-right: 0.375rem;"></i>초기화
                    </button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; color: #6B7280; font-size: 0.875rem; font-weight: 700;">
                    <span>검색 결과 <strong id="operatorFilteredCount" style="color: #111827;">0</strong>명 / 전체 <strong id="operatorTotalCount" style="color: #111827;">0</strong>명</span>
                    <button onclick="loadOperatorParticipants()" class="btn btn-sm btn-secondary">
                        <i class="fas fa-sync-alt" style="margin-right: 0.375rem;"></i>새로고침
                    </button>
                </div>

                <div class="operator-table-wrap">
                    <table class="operator-table">
                        <thead>
                            <tr>
                                <th>참석</th>
                                <th>이름</th>
                                <th>성별</th>
                                <th>교급</th>
                                <th>생년월일</th>
                                <th>등록일시</th>
                                <th>방문형태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody id="operatorParticipantsBody">
                            <tr>
                                <td colspan="8" style="text-align: center; color: #6B7280; padding: 2rem;">참가자 목록을 불러오는 중...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </main>

    <div id="participantEditModal" class="operator-modal" role="dialog" aria-modal="true" aria-labelledby="participantEditTitle">
        <div class="operator-modal-card">
            <h3 id="participantEditTitle" style="margin: 0 0 1rem; color: #111827; font-size: 1.25rem;">참가자 정보 수정</h3>
            <form id="participantEditForm" style="display: grid; gap: 0.875rem;">
                <input type="hidden" id="editParticipantId">
                <div class="operator-field">
                    <label for="editParticipantName">이름</label>
                    <input id="editParticipantName" type="text" required>
                </div>
                <div class="operator-field">
                    <label for="editParticipantGender">성별</label>
                    <select id="editParticipantGender" required>
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                    </select>
                </div>
                <div class="operator-field">
                    <label for="editParticipantGrade">교급</label>
                    <select id="editParticipantGrade" required>
                        <option value="유아">유아</option>
                        <option value="초등">초등</option>
                        <option value="중등">중등</option>
                        <option value="고등">고등</option>
                        <option value="성인">성인</option>
                    </select>
                </div>
                <div class="operator-field">
                    <label for="editParticipantBirth">생년월일</label>
                    <input id="editParticipantBirth" type="date" required>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
                    <button type="button" onclick="closeParticipantEditModal()" class="btn btn-secondary">취소</button>
                    <button type="submit" class="btn btn-primary">저장</button>
                </div>
            </form>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script>
        let genderChart, gradeChart, timeChart
        let boothId
        let operatorParticipants = []
        let operatorFilteredParticipants = []

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

        function switchOperatorTab(tabName) {
            document.querySelectorAll('.operator-tab-panel').forEach(panel => panel.classList.remove('active'))
            document.querySelectorAll('.operator-tab-button').forEach(button => button.classList.remove('active'))

            document.getElementById(tabName === 'participants' ? 'operatorParticipantsTab' : 'operatorOverviewTab').classList.add('active')
            document.getElementById(tabName === 'participants' ? 'operatorParticipantsTabButton' : 'operatorOverviewTabButton').classList.add('active')

            if (tabName === 'participants') {
                loadOperatorParticipants()
            }
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
                await loadOperatorParticipants()
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

        async function loadOperatorParticipants() {
            const tbody = document.getElementById('operatorParticipantsBody')
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6B7280; padding: 2rem;">참가자 목록을 불러오는 중...</td></tr>'
            }

            try {
                const params = { limit: 100000 }
                const date = document.getElementById('participantDate')?.value
                if (date) {
                    params.date = date
                }

                const response = await ParticipantsAPI.getAll(params)
                operatorParticipants = response.participants || []
                filterOperatorParticipants()
            } catch (error) {
                console.error('참가자 목록 로드 실패:', error)
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #DC2626; padding: 2rem;">참가자 목록을 불러오지 못했습니다.</td></tr>'
                }
            }
        }

        function filterOperatorParticipants() {
            const search = (document.getElementById('participantSearch')?.value || '').trim().toLowerCase()
            const attendedFilter = document.getElementById('participantAttendanceFilter')?.value || ''
            const visitFilter = document.getElementById('participantVisitFilter')?.value || ''

            operatorFilteredParticipants = operatorParticipants.filter(participant => {
                if (search && !String(participant.name || '').toLowerCase().includes(search)) return false
                if (attendedFilter !== '' && String(Number(participant.attended || 0)) !== attendedFilter) return false
                if (visitFilter !== '' && participant.visit_scope !== visitFilter) return false
                return true
            })

            renderOperatorParticipants()
        }

        function renderOperatorParticipants() {
            const tbody = document.getElementById('operatorParticipantsBody')
            if (!tbody) return

            document.getElementById('operatorFilteredCount').textContent = operatorFilteredParticipants.length
            document.getElementById('operatorTotalCount').textContent = operatorParticipants.length

            if (operatorFilteredParticipants.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6B7280; padding: 2rem;">검색 결과가 없습니다.</td></tr>'
                return
            }

            tbody.innerHTML = ''
            operatorFilteredParticipants.forEach(participant => {
                const row = document.createElement('tr')
                const attended = Number(participant.attended || 0) === 1
                const visitType = participant.visit_label || (Number(participant.is_duplicate || 0) === 1 ? '재방문' : '첫방문')
                row.innerHTML =
                    '<td>' +
                        '<label style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 800; cursor: pointer;">' +
                            '<input type="checkbox" ' + (attended ? 'checked' : '') + ' onchange="toggleOperatorAttendance(\\'' + participant.id + '\\', this.checked)" style="width: 18px; height: 18px; accent-color: #111827;">' +
                            '<span>' + (attended ? '확인' : '미확인') + '</span>' +
                        '</label>' +
                    '</td>' +
                    '<td><strong>' + escapeHtml(participant.name || '') + '</strong></td>' +
                    '<td>' + escapeHtml(participant.gender || '') + '</td>' +
                    '<td>' + escapeHtml(participant.grade || '') + '</td>' +
                    '<td>' + escapeHtml(participant.date_of_birth || '') + '</td>' +
                    '<td>' + formatOperatorDateTime(participant.created_at_kst || participant.created_at) + '</td>' +
                    '<td><span class="operator-status-pill">' + visitType + '</span></td>' +
                    '<td><div class="operator-inline-actions">' +
                        '<button onclick="openParticipantEditModal(\\'' + participant.id + '\\')" class="btn btn-sm btn-secondary"><i class="fas fa-edit"></i></button>' +
                        '<button onclick="deleteOperatorParticipant(\\'' + participant.id + '\\')" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>' +
                    '</div></td>'
                tbody.appendChild(row)
            })
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
        }

        function formatOperatorDateTime(value) {
            if (!value) return '-'
            return new Date(value).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        async function toggleOperatorAttendance(participantId, attended) {
            try {
                await ParticipantsAPI.updateAttendance(participantId, attended)
                const participant = operatorParticipants.find(item => String(item.id) === String(participantId))
                if (participant) {
                    participant.attended = attended ? 1 : 0
                    participant.attended_at = attended ? new Date().toISOString() : null
                }
                filterOperatorParticipants()
            } catch (error) {
                alert('참석 상태 변경에 실패했습니다: ' + error.message)
                await loadOperatorParticipants()
            }
        }

        function openParticipantEditModal(participantId) {
            const participant = operatorParticipants.find(item => String(item.id) === String(participantId))
            if (!participant) return

            document.getElementById('editParticipantId').value = participant.id
            document.getElementById('editParticipantName').value = participant.name || ''
            document.getElementById('editParticipantGender').value = participant.gender || '남성'
            document.getElementById('editParticipantGrade').value = participant.grade || '초등'
            document.getElementById('editParticipantBirth').value = participant.date_of_birth || ''
            document.getElementById('participantEditModal').classList.add('active')
        }

        function closeParticipantEditModal() {
            document.getElementById('participantEditModal').classList.remove('active')
        }

        document.getElementById('participantEditForm').addEventListener('submit', async (event) => {
            event.preventDefault()
            const participantId = document.getElementById('editParticipantId').value
            const payload = {
                name: document.getElementById('editParticipantName').value.trim(),
                gender: document.getElementById('editParticipantGender').value,
                grade: document.getElementById('editParticipantGrade').value,
                date_of_birth: document.getElementById('editParticipantBirth').value
            }

            try {
                await ParticipantsAPI.update(participantId, payload)
                closeParticipantEditModal()
                await loadOperatorParticipants()
                await loadStats()
            } catch (error) {
                alert('참가자 정보 수정에 실패했습니다: ' + error.message)
            }
        })

        async function deleteOperatorParticipant(participantId) {
            const participant = operatorParticipants.find(item => String(item.id) === String(participantId))
            const name = participant?.name || '참가자'
            if (!confirm(name + ' 참가자를 삭제하시겠습니까?\\n관련 대기열 정보도 함께 삭제됩니다.')) return

            try {
                await ParticipantsAPI.delete(participantId)
                await loadOperatorParticipants()
                await loadStats()
            } catch (error) {
                alert('참가자 삭제에 실패했습니다: ' + error.message)
            }
        }

        function resetOperatorParticipantFilters() {
            document.getElementById('participantSearch').value = ''
            document.getElementById('participantDate').value = ''
            document.getElementById('participantAttendanceFilter').value = ''
            document.getElementById('participantVisitFilter').value = ''
            loadOperatorParticipants()
        }

        // CSV 내보내기 (부스 운영자용)
        async function exportBoothCSV() {
            try {
                let boothParticipants = operatorFilteredParticipants.length > 0 ? operatorFilteredParticipants : operatorParticipants
                if (boothParticipants.length === 0) {
                    const params = { limit: 100000 }
                    const date = document.getElementById('participantDate')?.value
                    if (date) {
                        params.date = date
                    }
                    const response = await ParticipantsAPI.getAll(params)
                    boothParticipants = response.participants || []
                }
                
                if (boothParticipants.length === 0) {
                    alert('내보낼 참가자 데이터가 없습니다.')
                    return
                }
                
                // CSV 헤더 (UTF-8 BOM 추가)
                let csv = '\\uFEFF이름,성별,교급,생년월일,등록일시,방문형태,참석확인\\n'
                
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
                    const visitType = p.visit_label || (p.is_duplicate === 1 ? '재방문' : '첫방문')
                    const attended = Number(p.attended || 0) === 1 ? '참석' : '미확인'
                    csv += \`\${p.name},\${p.gender},\${p.grade},\${p.date_of_birth},\${createdAt},\${visitType},\${attended}\\n\`
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
