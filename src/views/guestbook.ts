/**
 * 방명록 작성 폼 페이지 (한 페이지에 한 질문씩)
 */

export const guestbookPage = (publicUrl: string) => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>방명록 작성 - 축제 디지털방명록 시스템</title>
    
    <!-- PWA 설정 -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#007AFF">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="방명록">
    
    <link href="/static/style.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    
    <!-- 오프라인 모드 스크립트 -->
    <script src="/static/offline-db.js"></script>
    <script src="/static/sync-manager.js"></script>
    <style>
        /* 방명록 페이지 전용 스타일 */
        body, html {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        /* 세로 모드 (모바일 기본) */
        @media (orientation: portrait) {
            body, html {
                overflow-x: hidden;
                overflow-y: auto;
                min-height: 100vh;
                width: 100vw;
            }
        }
        
        /* 가로 모드 최적화 - 2열 레이아웃 */
        @media (orientation: landscape) {
            body {
                overflow-y: auto;
                overflow-x: hidden;
                min-height: 100vh;
            }
            
            /* 가로모드 컨테이너 최적화 */
            .landscape-container {
                max-width: 90vw !important;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                align-items: start;
                padding: 1rem;
            }
            
            /* 진행 표시줄은 전체 너비 */
            .landscape-container > .w-full:first-child {
                grid-column: 1 / -1;
            }
            
            /* 폼 섹션과 미리보기를 나란히 */
            .form-section {
                grid-column: 1 / 2;
            }
            
            /* 버튼 영역도 2열 */
            .button-area {
                grid-column: 1 / -1;
                display: flex;
                justify-content: center;
                gap: 1rem;
            }
        }
        
        /* 태블릿 가로모드 (1024px 이상) */
        @media (orientation: landscape) and (min-width: 1024px) {
            .landscape-container {
                max-width: 1200px !important;
                gap: 3rem;
            }
            
            .form-section {
                font-size: 1.1rem;
            }
            
            input, select, button {
                font-size: 1.1rem !important;
                padding: 1rem !important;
            }
        }
        
        /* Note: .sr-only is already defined in /static/style.css */
        
        .step-indicator {
            transition: all var(--transition-base);
        }
        .step-active {
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            color: white;
        }
        .step-completed {
            background: var(--color-success);
            color: white;
        }
        .step-inactive {
            background: var(--color-neutral-300);
            color: var(--color-neutral-600);
        }
        .form-section {
            display: none;
        }
        .form-section.active {
            display: block;
            animation: fadeIn var(--transition-slow) ease;
        }
        /* fadeIn already defined in /static/style.css */
        .radio-card {
            cursor: pointer;
            transition: all var(--transition-fast);
            border-radius: var(--radius-xl);
        }
        .radio-card > div {
            border: none !important;
            background: rgba(0, 0, 0, 0.03);
        }
        .radio-card:hover > div {
            transform: scale(1.02);
            box-shadow: var(--shadow-md);
            background: rgba(0, 122, 255, 0.05);
        }
        .radio-card:focus-within > div {
            transform: scale(1.02);
            box-shadow: var(--shadow-md);
        }
        .radio-card input:checked + div {
            border: none !important;
            background: rgba(0, 122, 255, 0.15) !important;
            box-shadow: 0 0 0 2px var(--color-primary);
        }
        /* 선택 애니메이션 */
        .radio-card.selecting {
            animation: selectPulse 0.4s ease-in-out;
        }
        @keyframes selectPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .radio-card .check-icon {
            display: none;
            position: absolute;
            top: var(--space-2);
            right: var(--space-2);
            color: var(--color-success);
            font-size: 1.5rem;
        }
        .radio-card.selecting .check-icon {
            display: block;
            animation: checkFadeIn var(--transition-base) ease-in-out;
        }
        @keyframes checkFadeIn {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
        }
        .progress-bar {
            height: 4px;
            background: var(--color-neutral-300);
            border-radius: var(--radius-sm);
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            transition: width var(--transition-base);
        }
        .main-card {
            position: relative;
        }
        
        /* 뷰포트 높이 기반 레이아웃 */
        .container-wrapper {
            display: flex;
            flex-direction: column;
        }
        
        /* 세로 모드 - 최소 높이 + 스크롤 */
        @media (orientation: portrait) {
            .container-wrapper {
                min-height: 100vh;
                overflow-y: auto;
                overflow-x: hidden;
            }
        }
        
        /* 가로 모드 - 최소 높이 + 스크롤 */
        @media (orientation: landscape) {
            .container-wrapper {
                min-height: 100vh;
                padding-bottom: 2rem;
            }
        }
        
        .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 1rem 0;
            overflow-y: visible;
        }
        
        /* 세로 모드 - 자연스러운 흐름 */
        @media (orientation: portrait) {
            .content-area {
                padding: 0.5rem 0 2rem 0;
            }
        }
        
        /* 가로 모드 - 자동 높이 */
        @media (orientation: landscape) {
            .content-area {
                overflow-y: visible;
            }
        }
        
        /* 모바일 최적화 - 한 화면에 모두 표시 (갤럭시 S22 등 소형 디바이스 대응) */
        @media (max-width: 640px) {
            body, html {
                height: 100vh;
                overflow: hidden;
            }
            
            .container-wrapper {
                height: 100vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .content-area {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 0.25rem 0 0.25rem 0;
                min-height: 0; /* Flexbox overflow 수정 */
                -webkit-overflow-scrolling: touch;
            }
            
            /* 헤더 최소화 */
            .page-header {
                padding: 0.5rem 0 !important;
            }
            
            .page-header h1 {
                font-size: 1.125rem !important;
                margin-bottom: 0.125rem !important;
            }
            
            .page-header .icon-circle {
                width: 40px !important;
                height: 40px !important;
                margin-bottom: 0.25rem !important;
            }
            
            .page-header .icon-circle i {
                font-size: 1.125rem !important;
            }
            
            /* 진행률 바 최소화 */
            .progress-section {
                padding: 0.25rem 0 !important;
            }
            
            .progress-section p {
                font-size: 0.8125rem !important;
                margin-bottom: 0.25rem !important;
            }
            
            /* 폼 섹션 최적화 */
            .form-section {
                padding: 0 !important;
            }
            
            /* 섹션 헤더 최소화 */
            .section-header {
                margin-bottom: 0.75rem !important;
            }
            
            .section-header .icon-circle {
                width: 48px !important;
                height: 48px !important;
                margin-bottom: 0.25rem !important;
            }
            
            .section-header .icon-circle i {
                font-size: 1.25rem !important;
            }
            
            .section-header h2 {
                font-size: 1.125rem !important;
                margin-bottom: 0.125rem !important;
            }
            
            .section-header p {
                font-size: 0.8125rem !important;
            }
            
            /* 카드 패딩 줄이기 */
            .main-card {
                padding: 0.75rem !important;
                margin-bottom: 0.375rem !important;
            }
            
            /* 버튼 크기 조정 */
            button {
                padding: 0.625rem 0.875rem !important;
                font-size: 0.875rem !important;
                min-height: 40px !important;
            }
            
            /* Select 박스 간격 */
            select {
                margin-bottom: 0.5rem !important;
                padding: 0.625rem !important;
                font-size: 0.9375rem !important;
            }
            
            /* Input 필드 */
            input {
                padding: 0.625rem !important;
                font-size: 0.9375rem !important;
            }
            
            /* 동의 섹션 컴팩트 */
            .privacy-box {
                padding: 0.75rem !important;
                margin-bottom: 0.75rem !important;
            }
            
            .privacy-item {
                margin-bottom: 0.375rem !important;
                font-size: 0.8125rem !important;
                line-height: 1.3 !important;
            }
            
            /* 라디오 카드 최적화 */
            .radio-card > div {
                padding: 0.75rem !important;
            }
            
            .radio-card i.fa-mars,
            .radio-card i.fa-venus {
                font-size: 1.75rem !important;
                margin-bottom: 0.25rem !important;
            }
            
            .radio-card label {
                font-size: 0.9375rem !important;
            }
            
            /* 날짜 선택기 */
            .date-selectors {
                gap: 0.375rem !important;
            }
            
            .date-selectors select {
                padding: 0.625rem 0.375rem !important;
                font-size: 0.875rem !important;
            }
            
            .date-selectors label {
                font-size: 0.8125rem !important;
                margin-bottom: 0.25rem !important;
            }
            
            /* 에러 메시지 */
            .error-message {
                font-size: 0.8125rem !important;
                padding: 0.5rem !important;
            }
            
            /* 뒤로가기 버튼 */
            .back-button {
                padding: 0.5rem 0.875rem !important;
                font-size: 0.875rem !important;
            }
        }
        
        /* 태블릿 세로 모드 최적화 */
        @media (min-width: 641px) and (max-width: 1024px) and (orientation: portrait) {
            .container-wrapper {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .content-area {
                flex: 1;
                overflow-y: auto;
                padding: 1rem 0;
            }
            
            .main-card {
                padding: 1.5rem !important;
            }
            
            .section-header .icon-circle {
                width: 64px !important;
                height: 64px !important;
            }
            
            button {
                padding: 0.875rem 1.5rem !important;
                font-size: 1rem !important;
            }
        }
        
        /* 컴팩트한 여백 */
        .compact-spacing {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
        
        /* QR 코드 관련 스타일 */
        .qr-code-small {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 50;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .qr-code-small:hover {
            transform: scale(1.05);
        }
        
        .qr-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 100;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(4px);
        }
        
        .qr-modal.active {
            display: flex;
            animation: fadeIn 0.3s ease;
        }
        
        .qr-modal-content {
            background: white;
            padding: 2rem;
            border-radius: 1.5rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 90%;
            animation: slideUp 0.3s ease;
        }

        .validation-hint {
            margin-top: var(--space-2);
            background: #FFF7ED;
            color: #9A3412;
            padding: var(--space-2) var(--space-3);
            border: 1px solid #FED7AA;
            border-radius: var(--radius-md);
            text-align: center;
            font-size: 0.9375rem;
            font-weight: 600;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 640px) {
            .qr-code-small {
                top: 10px;
                right: 10px;
            }
        }
    </style>
</head>
<body class="service-page service-guestbook">
    <!-- 우측 상단 작은 QR 코드 -->
    <div class="qr-code-small" onclick="openQRModal()" title="QR 코드 크게 보기">
        <div class="card" style="padding: var(--space-2); border: 2px solid var(--color-primary);">
            <div id="qrCodeSmall"></div>
        </div>
    </div>

    <!-- QR 코드 확대 모달 -->
    <div id="qrModal" class="qr-modal" onclick="closeQRModal()">
        <div class="qr-modal-content" onclick="event.stopPropagation()">
            <h3 class="text-title2" style="margin-bottom: var(--space-4);">
                <i class="fas fa-qrcode" aria-hidden="true" style="color: var(--color-primary); margin-right: var(--space-2);"></i>
                방명록 QR 코드
            </h3>
            <div id="qrCodeLarge" class="mx-auto mb-4" style="display: flex; justify-content: center;"></div>
            <p class="text-body" style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">
                QR 코드를 스캔하면<br>
                자동으로 방명록 작성 페이지로 이동합니다.
            </p>
            <button onclick="copyGuestbookLink()" class="btn btn-primary" style="margin-bottom: var(--space-2); display: inline-flex; align-items: center; gap: var(--space-2);">
                <i class="fas fa-copy" aria-hidden="true"></i>
                링크 복사
            </button>
            <p id="copySuccessModal" class="text-footnote hidden" style="color: var(--color-success);">
                <i class="fas fa-check-circle" aria-hidden="true"></i> 복사되었습니다!
            </p>
            <button onclick="closeQRModal()" class="btn btn-secondary" style="margin-top: var(--space-4);">
                <i class="fas fa-times" aria-hidden="true" style="margin-right: var(--space-2);"></i>닫기
            </button>
        </div>
    </div>

    <div class="container-wrapper" style="max-width: 600px; margin: 0 auto; padding: 0 var(--space-4);">
        <!-- 헤더 -->
        <div class="page-header compact-spacing" style="padding: var(--space-3) 0;">
            <!-- 뒤로가기 버튼 -->
            <button onclick="goBack()" class="btn btn-tertiary btn-sm" style="display: flex; align-items: center; gap: var(--space-2); color: white; margin-bottom: var(--space-2);">
                <i class="fas fa-arrow-left" aria-hidden="true"></i>
                <span>뒤로가기</span>
            </button>
            
            <div style="text-align: center; padding: var(--space-2) 0;">
                <div class="icon-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border-radius: 50%; margin-bottom: var(--space-2);">
                    <i class="fas fa-pen-fancy" aria-hidden="true" style="color: white; font-size: 1.5rem;"></i>
                </div>
                <h1 class="text-title2" style="color: white; margin-bottom: var(--space-1);">방명록 작성</h1>
                <p class="text-subheadline" style="color: rgba(255, 255, 255, 0.9);" id="boothName">부스명을 불러오는 중...</p>
            </div>
        </div>

        <!-- 진행률 바 -->
        <div class="progress-section compact-spacing" role="progressbar" aria-valuenow="17" aria-valuemin="0" aria-valuemax="100" aria-label="방명록 작성 진행률" style="padding: var(--space-2) 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-1);">
                <span id="stepText" class="text-caption1" style="color: rgba(255, 255, 255, 0.9);">1 / 6 단계</span>
                <span id="stepPercent" class="text-caption1" style="color: rgba(255, 255, 255, 0.9);">17%</span>
            </div>
            <div class="progress-bar">
                <div id="progressFill" class="progress-fill" style="width: 17%"></div>
            </div>
        </div>

        <!-- 메인 카드 -->
        <div class="content-area">
            <div class="card card-lg main-card" role="main" style="box-shadow: var(--shadow-xl);">
            <!-- Step 1: 개인정보 수집 동의 -->
            <div id="section1" class="form-section active" role="region" aria-labelledby="step1-heading">
                <div class="section-header" style="text-align: center; margin-bottom: var(--space-4);">
                    <div class="icon-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(0, 122, 255, 0.1); border-radius: 50%; margin-bottom: var(--space-2);" aria-hidden="true">
                        <i class="fas fa-shield-alt" style="color: var(--color-primary); font-size: 2rem;"></i>
                    </div>
                    <h2 id="step1-heading" class="text-title2" style="margin-bottom: var(--space-1);">개인정보 수집 동의</h2>
                    <p class="text-subheadline" style="color: var(--color-text-tertiary);">방명록 작성을 위해 동의가 필요합니다</p>
                </div>
                
                <div class="privacy-box" style="background: linear-gradient(135deg, rgba(0, 122, 255, 0.05), rgba(88, 86, 214, 0.05)); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4);">
                    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                        <div class="privacy-item" style="display: flex; align-items: flex-start; gap: var(--space-2);">
                            <i class="fas fa-check-circle" aria-hidden="true" style="color: var(--color-primary); margin-top: 2px; font-size: 0.75rem;"></i>
                            <div class="text-subheadline" style="color: var(--color-text-secondary);">
                                <strong>수집 항목:</strong> 이름, 성별, 교급, 생년월일
                            </div>
                        </div>
                        <div class="privacy-item" style="display: flex; align-items: flex-start; gap: var(--space-2);">
                            <i class="fas fa-check-circle" aria-hidden="true" style="color: var(--color-primary); margin-top: 2px; font-size: 0.75rem;"></i>
                            <div class="text-subheadline" style="color: var(--color-text-secondary);">
                                <strong>이용 목적:</strong> 행사 참가자 현황 파악 및 통계 분석
                            </div>
                        </div>
                        <div class="privacy-item" style="display: flex; align-items: flex-start; gap: var(--space-2);">
                            <i class="fas fa-check-circle" aria-hidden="true" style="color: var(--color-primary); margin-top: 2px; font-size: 0.75rem;"></i>
                            <div class="text-subheadline" style="color: var(--color-text-secondary);">
                                <strong>보유 기간:</strong> 수집일로부터 90일 후 자동 파기
                            </div>
                        </div>
                    </div>
                    
                    <!-- 상세 내용 펼치기 (선택적) -->
                    <button type="button" onclick="togglePrivacyDetails()" class="btn btn-tertiary btn-sm" style="margin-top: var(--space-3); display: flex; align-items: center; margin-left: auto; margin-right: auto;">
                        <span id="privacyToggleText">상세 내용 보기</span>
                        <i id="privacyToggleIcon" class="fas fa-chevron-down" aria-hidden="true" style="margin-left: var(--space-1); font-size: 0.75rem;"></i>
                    </button>
                    
                    <div id="privacyDetails" class="hidden text-caption1" style="margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid rgba(0, 122, 255, 0.2); color: var(--color-text-tertiary);">
                        <h3 class="font-semibold" style="margin-bottom: var(--space-1); color: var(--color-text-primary);">동의 거부 권리</h3>
                        <p>귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다. 단, 동의하지 않을 경우 방명록 작성이 제한됩니다.</p>
                    </div>
                </div>

                <!-- 큰 버튼형 동의 -->
                <button type="button" onclick="agreeAndProceed()" class="btn btn-primary btn-lg" style="width: 100%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); box-shadow: var(--shadow-lg);"
                    aria-label="개인정보 수집 및 활용에 동의하고 다음 단계로 이동">
                    <i class="fas fa-check-circle" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    동의하고 시작하기
                </button>
                
                <p class="text-caption1" style="margin-top: var(--space-2); text-align: center; color: var(--color-text-quaternary);">
                    버튼을 클릭하면 개인정보 수집 및 활용에 동의한 것으로 간주됩니다
                </p>
            </div>

            <!-- Step 2: 이름 -->
            <div id="section2" class="form-section" role="region" aria-labelledby="step2-heading">
                <div class="section-header" style="text-align: center; margin-bottom: var(--space-4);">
                    <div class="icon-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(0, 122, 255, 0.1); border-radius: 50%; margin-bottom: var(--space-2);" aria-hidden="true">
                        <i class="fas fa-id-card" style="color: var(--color-primary); font-size: 2rem;"></i>
                    </div>
                    <h2 id="step2-heading" class="text-title2" style="margin-bottom: var(--space-1);">이름을 알려주세요</h2>
                    <p class="text-subheadline" style="color: var(--color-text-tertiary);">본인의 실명을 입력해주세요</p>
                </div>

                <div style="margin-bottom: var(--space-4);">
                    <label for="name" class="sr-only">이름</label>
                    <input type="text" id="name" 
                        class="input"
                        style="width: 100%; text-align: center; font-size: 1.25rem;"
                        placeholder="예: 홍길동"
                        inputmode="text"
                        autocomplete="off"
                        aria-required="true"
                        aria-describedby="nameError">
                    <div id="nameError" class="validation-hint hidden" role="status" aria-live="polite">
                        <i class="fas fa-exclamation-circle" aria-hidden="true" style="margin-right: var(--space-1);"></i>
                        이름을 입력해주세요.
                    </div>
                </div>

                <div style="display: flex; gap: var(--space-2);">
                    <button onclick="goToStep(1)" class="btn btn-secondary" style="flex: 1;"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left" aria-hidden="true" style="margin-right: var(--space-1);"></i>이전
                    </button>
                    <button onclick="goToStep(3)" class="btn btn-primary" style="flex: 1; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); box-shadow: var(--shadow-lg);"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right" aria-hidden="true" style="margin-left: var(--space-1);"></i>
                    </button>
                </div>
            </div>

            <!-- Step 3: 성별 -->
            <div id="section3" class="form-section" role="region" aria-labelledby="step3-heading">
                <div class="section-header" style="text-align: center; margin-bottom: var(--space-4);">
                    <div class="icon-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(0, 122, 255, 0.1); border-radius: 50%; margin-bottom: var(--space-2);" aria-hidden="true">
                        <i class="fas fa-venus-mars" style="color: var(--color-primary); font-size: 2rem;"></i>
                    </div>
                    <h2 id="step3-heading" class="text-title2" style="margin-bottom: var(--space-1);">성별을 선택해주세요</h2>
                    <p class="text-subheadline" style="color: var(--color-text-tertiary);">통계 자료로 활용됩니다</p>
                </div>

                <fieldset style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4); border: none; padding: 0;" aria-required="true" aria-describedby="genderError">
                    <legend class="sr-only">성별 선택</legend>
                    <label class="radio-card" tabindex="0" onclick="selectGenderAndProceed('남성', event)" style="position: relative;">
                        <input type="radio" name="gender" value="남성" class="sr-only" aria-label="남성">
                        <div style="padding: var(--space-4); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-mars" aria-hidden="true" style="font-size: 2.5rem; color: #3b82f6; margin-bottom: var(--space-2); display: block;"></i>
                            <div class="text-headline">남성</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0" onclick="selectGenderAndProceed('여성', event)" style="position: relative;">
                        <input type="radio" name="gender" value="여성" class="sr-only" aria-label="여성">
                        <div style="padding: var(--space-4); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-venus" aria-hidden="true" style="font-size: 2.5rem; color: #ec4899; margin-bottom: var(--space-2); display: block;"></i>
                            <div class="text-headline">여성</div>
                        </div>
                    </label>
                </fieldset>

                <div id="genderError" class="validation-hint hidden" style="margin-bottom: var(--space-4);" role="status" aria-live="polite">
                    <i class="fas fa-exclamation-circle" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    성별을 선택해주세요.
                </div>

                <div style="display: flex; gap: var(--space-3);">
                    <button onclick="goToStep(2)" class="btn btn-secondary btn-lg" style="flex: 1;"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left" aria-hidden="true" style="margin-right: var(--space-2);"></i>이전
                    </button>
                    <button onclick="goToStep(4)" class="btn btn-primary btn-lg" style="flex: 1; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); box-shadow: var(--shadow-lg);"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right" aria-hidden="true" style="margin-left: var(--space-2);"></i>
                    </button>
                </div>
            </div>

            <!-- Step 4: 교급 -->
            <div id="section4" class="form-section" role="region" aria-labelledby="step4-heading">
                <div class="section-header" style="text-align: center; margin-bottom: var(--space-3);">
                    <div class="icon-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(0, 122, 255, 0.1); border-radius: 50%; margin-bottom: var(--space-2);" aria-hidden="true">
                        <i class="fas fa-graduation-cap" style="color: var(--color-primary); font-size: 2rem;"></i>
                    </div>
                    <h2 id="step4-heading" class="text-title2" style="margin-bottom: var(--space-1);">학교급을 선택해주세요</h2>
                    <p class="text-subheadline" style="color: var(--color-text-tertiary);">현재 재학 중이신 학교급을 선택해주세요</p>
                </div>

                <fieldset style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); margin-bottom: var(--space-3); border: none; padding: 0;" aria-required="true" aria-describedby="gradeError">
                    <legend class="sr-only">학교급 선택</legend>
                    <label class="radio-card" tabindex="0" onclick="selectGradeAndProceed('유아', event)" style="position: relative;">
                        <input type="radio" name="grade" value="유아" class="sr-only" aria-label="유아">
                        <div style="padding: var(--space-3); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-baby" aria-hidden="true" style="font-size: 2rem; color: #eab308; margin-bottom: var(--space-1); display: block;"></i>
                            <div class="text-subheadline font-semibold">유아</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0" onclick="selectGradeAndProceed('초등', event)" style="position: relative;">
                        <input type="radio" name="grade" value="초등" class="sr-only" aria-label="초등학생">
                        <div style="padding: var(--space-3); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-child" aria-hidden="true" style="font-size: 2rem; color: #22c55e; margin-bottom: var(--space-1); display: block;"></i>
                            <div class="text-subheadline font-semibold">초등</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0" onclick="selectGradeAndProceed('중등', event)" style="position: relative;">
                        <input type="radio" name="grade" value="중등" class="sr-only" aria-label="중학생">
                        <div style="padding: var(--space-3); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-user-graduate" aria-hidden="true" style="font-size: 2rem; color: #3b82f6; margin-bottom: var(--space-1); display: block;"></i>
                            <div class="text-subheadline font-semibold">중등</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0" onclick="selectGradeAndProceed('고등', event)" style="position: relative;">
                        <input type="radio" name="grade" value="고등" class="sr-only" aria-label="고등학생">
                        <div style="padding: var(--space-3); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-graduation-cap" aria-hidden="true" style="font-size: 2rem; color: #a855f7; margin-bottom: var(--space-1); display: block;"></i>
                            <div class="text-subheadline font-semibold">고등</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0" onclick="selectGradeAndProceed('성인', event)" style="position: relative;">
                        <input type="radio" name="grade" value="성인" class="sr-only" aria-label="성인">
                        <div style="padding: var(--space-3); border-radius: var(--radius-xl); text-align: center;">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-user-tie" aria-hidden="true" style="font-size: 2rem; color: #6366f1; margin-bottom: var(--space-1); display: block;"></i>
                            <div class="text-subheadline font-semibold">성인</div>
                        </div>
                    </label>
                </fieldset>

                <div id="gradeError" class="validation-hint hidden" style="margin-bottom: var(--space-4);" role="status" aria-live="polite">
                    <i class="fas fa-exclamation-circle" aria-hidden="true" style="margin-right: var(--space-2);"></i>
                    학교급을 선택해주세요.
                </div>

                <div style="display: flex; gap: var(--space-3);">
                    <button onclick="goToStep(3)" class="btn btn-secondary btn-lg" style="flex: 1;"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left" aria-hidden="true" style="margin-right: var(--space-2);"></i>이전
                    </button>
                    <button onclick="goToStep(5)" class="btn btn-primary btn-lg" style="flex: 1; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); box-shadow: var(--shadow-lg);"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right" aria-hidden="true" style="margin-left: var(--space-2);"></i>
                    </button>
                </div>
            </div>

            <!-- Step 5: 생년월일 -->
            <div id="section5" class="form-section" role="region" aria-labelledby="step5-heading">
                <div class="section-header" style="text-align: center; margin-bottom: var(--space-3);">
                    <div class="icon-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(0, 122, 255, 0.1); border-radius: 50%; margin-bottom: var(--space-2);" aria-hidden="true">
                        <i class="fas fa-calendar-alt" style="color: var(--color-primary); font-size: 2rem;"></i>
                    </div>
                    <h2 id="step5-heading" class="text-title2" style="margin-bottom: var(--space-1);">생년월일을 알려주세요</h2>
                    <p class="text-subheadline" style="color: var(--color-text-tertiary);">동명이인 구분을 위해 필요합니다</p>
                </div>

                <div style="margin-bottom: var(--space-4);">
                    <!-- 년/월/일 분리형 선택기 -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);">
                        <!-- 년도 선택 -->
                        <div>
                            <label for="birthYear" class="text-subheadline font-semibold" style="display: block; text-align: center; margin-bottom: var(--space-2);">년</label>
                            <select id="birthYear" 
                                class="input"
                                style="width: 100%; padding: var(--space-2); font-size: 1.25rem; text-align: center; cursor: pointer; background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23007AFF\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.5rem center; padding-right: 2.5rem; appearance: none; min-height: 70px;"
                                aria-required="true">
                                <option value="">선택</option>
                            </select>
                        </div>
                        
                        <!-- 월 선택 -->
                        <div>
                            <label for="birthMonth" class="text-subheadline font-semibold" style="display: block; text-align: center; margin-bottom: var(--space-2);">월</label>
                            <select id="birthMonth" 
                                class="input"
                                style="width: 100%; padding: var(--space-2); font-size: 1.25rem; text-align: center; cursor: pointer; background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23007AFF\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.5rem center; padding-right: 2.5rem; appearance: none; min-height: 70px;"
                                aria-required="true">
                                <option value="">선택</option>
                                <option value="01">1월</option>
                                <option value="02">2월</option>
                                <option value="03">3월</option>
                                <option value="04">4월</option>
                                <option value="05">5월</option>
                                <option value="06">6월</option>
                                <option value="07">7월</option>
                                <option value="08">8월</option>
                                <option value="09">9월</option>
                                <option value="10">10월</option>
                                <option value="11">11월</option>
                                <option value="12">12월</option>
                            </select>
                        </div>
                        
                        <!-- 일 선택 -->
                        <div>
                            <label for="birthDay" class="text-subheadline font-semibold" style="display: block; text-align: center; margin-bottom: var(--space-2);">일</label>
                            <select id="birthDay" 
                                class="input"
                                style="width: 100%; padding: var(--space-2); font-size: 1.25rem; text-align: center; cursor: pointer; background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23007AFF\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.5rem center; padding-right: 2.5rem; appearance: none; min-height: 70px;"
                                aria-required="true"
                                disabled>
                                <option value="">월 선택 후</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- 선택된 날짜 실시간 미리보기 -->
                    <div id="datePreviewBox" style="margin-top: var(--space-4); padding: var(--space-4); background: rgba(0, 122, 255, 0.05); border-radius: var(--radius-xl); text-align: center; transition: all var(--transition-base);">
                        <p class="text-subheadline" style="color: var(--color-text-tertiary); margin-bottom: var(--space-1);">선택한 생년월일</p>
                        <p id="datePreview" class="text-title2" style="color: var(--color-text-quaternary);">
                            선택해주세요
                        </p>
                    </div>
                    
                    <div id="dateError" class="validation-hint hidden" role="status" aria-live="polite">
                        <i class="fas fa-exclamation-circle" aria-hidden="true" style="margin-right: var(--space-1);"></i>
                        <span id="dateErrorText">생년월일을 모두 선택해주세요.</span>
                    </div>
                </div>

                <div style="display: flex; gap: var(--space-2);">
                    <button onclick="goToStep(4)" class="btn btn-secondary" style="flex: 1;"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left" aria-hidden="true" style="margin-right: var(--space-1);"></i>이전
                    </button>
                    <button onclick="submitForm()" id="submitBtn" class="btn btn-primary" style="flex: 1; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); box-shadow: var(--shadow-lg);"
                        aria-label="방명록 제출"
                        disabled>
                        제출하기 <i class="fas fa-check" aria-hidden="true" style="margin-left: var(--space-1);"></i>
                    </button>
                </div>
            </div>

            <!-- Step 6: 완료 -->
            <div id="section6" class="form-section" style="text-align: center;" role="region" aria-labelledby="step6-heading" aria-live="polite">
                <div style="margin-bottom: var(--space-4);">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 120px; height: 120px; background: var(--color-success-bg); border-radius: 50%; margin-bottom: var(--space-3); animation: bounce 1s ease-in-out infinite;" aria-hidden="true">
                        <i class="fas fa-check-circle" style="color: var(--color-success); font-size: 4rem;"></i>
                    </div>
                </div>
                
                <h2 id="step6-heading" class="text-title1" style="margin-bottom: var(--space-3);">
                    등록 완료!
                </h2>
                
                <p class="text-body" style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">
                    소중한 시간 내어 방명록을 작성해주셔서 감사합니다.<br>
                    <strong>즐거운 시간 되세요!</strong> 🎉
                </p>

                <div style="background: rgba(0, 122, 255, 0.05); padding: var(--space-4); border-radius: var(--radius-lg);" role="status">
                    <p class="text-caption1" style="color: var(--color-text-tertiary);">
                        <i class="fas fa-info-circle" aria-hidden="true" style="color: var(--color-primary); margin-right: var(--space-1);"></i>
                        3초 후 자동으로 새로고침됩니다.<br>
                        <span style="display: block; margin-top: var(--space-1); color: var(--color-text-quaternary);">다음 참가자도 작성 가능합니다</span>
                    </p>
                </div>
            </div>
            </div>
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

        // 년도 선택 옵션 생성 (1950 ~ 올해)
        const birthYearSelect = document.getElementById('birthYear')
        const currentYear = new Date().getFullYear()
        for (let year = currentYear; year >= 1950; year--) {
            const option = document.createElement('option')
            option.value = year
            option.textContent = year + '년'
            birthYearSelect.appendChild(option)
        }

        // 월 선택 시 일 옵션 업데이트
        document.getElementById('birthMonth').addEventListener('change', updateDayOptions)
        document.getElementById('birthYear').addEventListener('change', updateDayOptions)
        
        // 날짜 선택 시 실시간 미리보기 업데이트
        document.getElementById('birthYear').addEventListener('change', updateDatePreview)
        document.getElementById('birthMonth').addEventListener('change', updateDatePreview)
        document.getElementById('birthDay').addEventListener('change', updateDatePreview)

        function updateDayOptions() {
            const year = document.getElementById('birthYear').value
            const month = document.getElementById('birthMonth').value
            const daySelect = document.getElementById('birthDay')
            
            // 일 선택 초기화
            daySelect.innerHTML = '<option value="">선택</option>'
            
            if (year && month) {
                // 일 선택 활성화
                daySelect.disabled = false
                daySelect.classList.remove('opacity-50', 'cursor-not-allowed')
                
                // 해당 월의 마지막 날 계산 (윤년 자동 처리)
                const lastDay = new Date(year, parseInt(month), 0).getDate()
                
                for (let day = 1; day <= lastDay; day++) {
                    const option = document.createElement('option')
                    const dayStr = day.toString().padStart(2, '0')
                    option.value = dayStr
                    option.textContent = day + '일'
                    daySelect.appendChild(option)
                }
            } else {
                // 년/월 미선택 시 일 선택 비활성화
                daySelect.disabled = true
                daySelect.classList.add('opacity-50', 'cursor-not-allowed')
                daySelect.innerHTML = '<option value="">월 선택 후</option>'
            }
            
            // 미리보기 업데이트
            updateDatePreview()
        }
        
        // 선택된 날짜 실시간 미리보기
        function updateDatePreview() {
            const year = document.getElementById('birthYear').value
            const month = document.getElementById('birthMonth').value
            const day = document.getElementById('birthDay').value
            const preview = document.getElementById('datePreview')
            const previewBox = document.getElementById('datePreviewBox')
            const submitBtn = document.getElementById('submitBtn')
            
            if (year && month && day) {
                // 모두 선택됨
                const monthNum = parseInt(month)
                const dayNum = parseInt(day)
                preview.textContent = year + '년 ' + monthNum + '월 ' + dayNum + '일'
                preview.classList.remove('text-gray-400')
                preview.classList.add('text-purple-600')
                previewBox.classList.add('ring-2', 'ring-purple-300')
                
                // 제출 버튼 활성화
                if (submitBtn) {
                    submitBtn.disabled = false
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed')
                }
                
                // 에러 메시지 숨기기
                document.getElementById('dateError').classList.add('hidden')
            } else if (year || month || day) {
                // 일부만 선택됨
                const parts = []
                if (year) parts.push(year + '년')
                if (month) parts.push(parseInt(month) + '월')
                if (day) parts.push(parseInt(day) + '일')
                preview.textContent = parts.join(' ') + ' (미완성)'
                preview.classList.remove('text-purple-600')
                preview.classList.add('text-gray-400')
                previewBox.classList.remove('ring-2', 'ring-purple-300')
                
                // 제출 버튼 비활성화
                if (submitBtn) {
                    submitBtn.disabled = true
                    submitBtn.classList.add('opacity-50', 'cursor-not-allowed')
                }
            } else {
                // 아무것도 선택 안 됨
                preview.textContent = '선택해주세요'
                preview.classList.remove('text-purple-600')
                preview.classList.add('text-gray-400')
                previewBox.classList.remove('ring-2', 'ring-purple-300')
                
                // 제출 버튼 비활성화
                if (submitBtn) {
                    submitBtn.disabled = true
                    submitBtn.classList.add('opacity-50', 'cursor-not-allowed')
                }
            }
        }

        // 개인정보 상세 내용 토글
        function togglePrivacyDetails() {
            const details = document.getElementById('privacyDetails')
            const toggleText = document.getElementById('privacyToggleText')
            const toggleIcon = document.getElementById('privacyToggleIcon')
            
            if (details.classList.contains('hidden')) {
                details.classList.remove('hidden')
                toggleText.textContent = '상세 내용 닫기'
                toggleIcon.className = 'fas fa-chevron-up ml-2'
            } else {
                details.classList.add('hidden')
                toggleText.textContent = '상세 내용 보기'
                toggleIcon.className = 'fas fa-chevron-down ml-2'
            }
        }

        // 동의하고 진행
        function agreeAndProceed() {
            // 동의 간주하고 바로 다음 단계로
            goToStep(2)
        }

        // 사용자 입력 데이터 저장
        const formData = {
            name: '',
            gender: '',
            grade: '',
            dateOfBirth: ''
        }

        // 현재 스텝 추적 (1-6)
        let currentStep = 1

        // 작성 완료 여부
        let isFormCompleted = false

        function hideValidationHint(id) {
            const element = document.getElementById(id)
            if (element) element.classList.add('hidden')
        }

        function clearValidationHints() {
            ;['nameError', 'genderError', 'gradeError', 'dateError'].forEach(hideValidationHint)
        }

        document.getElementById('name')?.addEventListener('input', (event) => {
            if (event.target.value.trim()) {
                hideValidationHint('nameError')
            }
        })

        document.querySelectorAll('input[name="gender"]').forEach(input => {
            input.addEventListener('change', () => hideValidationHint('genderError'))
        })

        document.querySelectorAll('input[name="grade"]').forEach(input => {
            input.addEventListener('change', () => hideValidationHint('gradeError'))
        })

        ;['birthYear', 'birthMonth', 'birthDay'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => hideValidationHint('dateError'))
        })

        // 뒤로가기 함수
        function goBack() {
            if (currentStep > 1 && !isFormCompleted) {
                if (confirm('작성 중인 내용이 저장되지 않습니다. 이전 페이지로 돌아가시겠습니까?')) {
                    window.history.back()
                }
            } else {
                window.history.back()
            }
        }

        // 페이지 이탈 경고 (Step 2-5에만 적용)
        window.addEventListener('beforeunload', function(e) {
            // Step 1(동의), Step 6(완료) 제외, 작성 완료된 경우 제외
            if (currentStep >= 2 && currentStep <= 5 && !isFormCompleted) {
                const message = '작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?'
                e.preventDefault()
                e.returnValue = message
                return message
            }
        })

        // 부스 정보 로드
        async function loadBoothInfo() {
            try {
                const response = await fetch(\`/api/booths/\${boothId}\`)
                const data = await response.json()
                if (data.booth) {
                    document.getElementById('boothName').textContent = data.booth.name
                }
            } catch (error) {
                console.error('부스 정보 로드 실패:', error)
            }
        }

        loadBoothInfo()
        
        // QR 코드 생성 및 로드
        function generateQRCode() {
            // 프로덕션 URL 사용 (서버에서 주입된 PUBLIC_URL)
            const publicUrl = '${publicUrl}'
            // 쿼리 파라미터에 from=qr 추가
            const currentParams = new URLSearchParams(window.location.search)
            currentParams.set('from', 'qr')
            const guestbookUrl = publicUrl + window.location.pathname + '?' + currentParams.toString()
            
            // QRCode.js 라이브러리로 QR 코드 생성
            // 작은 QR 코드 (80x80)
            const qrSmallContainer = document.getElementById('qrCodeSmall')
            qrSmallContainer.innerHTML = '' // 기존 내용 제거
            
            new QRCode(qrSmallContainer, {
                text: guestbookUrl,
                width: 80,
                height: 80,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            })
            
            // 큰 QR 코드 (250x250)
            const qrLargeContainer = document.getElementById('qrCodeLarge')
            qrLargeContainer.innerHTML = '' // 기존 내용 제거
            
            new QRCode(qrLargeContainer, {
                text: guestbookUrl,
                width: 250,
                height: 250,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            })
        }
        
        // QR 모달 열기
        function openQRModal() {
            document.getElementById('qrModal').classList.add('active')
        }
        
        // QR 모달 닫기
        function closeQRModal() {
            document.getElementById('qrModal').classList.remove('active')
        }
        
        // 링크 복사
        function copyGuestbookLink() {
            const guestbookUrl = window.location.href
            
            navigator.clipboard.writeText(guestbookUrl).then(() => {
                const successMsg = document.getElementById('copySuccessModal')
                successMsg.classList.remove('hidden')
                
                setTimeout(() => {
                    successMsg.classList.add('hidden')
                }, 2000)
            }).catch(err => {
                console.error('복사 실패:', err)
                alert('링크 복사에 실패했습니다.')
            })
        }
        
        // 페이지 로드 시 QR 코드 생성
        generateQRCode()

        // 진행률 업데이트
        function updateProgress(step) {
            const percent = Math.round((step / 6) * 100)
            document.getElementById('stepText').textContent = \`\${step} / 6 단계\`
            document.getElementById('stepPercent').textContent = \`\${percent}%\`
            document.getElementById('progressFill').style.width = \`\${percent}%\`
            
            // ARIA 속성 업데이트 (스크린 리더용)
            const progressBar = document.querySelector('[role="progressbar"]')
            if (progressBar) {
                progressBar.setAttribute('aria-valuenow', percent)
                progressBar.setAttribute('aria-valuetext', \`\${step} / 6 단계, \${percent}% 완료\`)
            }
        }

        // 성별 선택 후 자동 진행
        function selectGenderAndProceed(value, event) {
            event.preventDefault()
            
            // 라디오 버튼 체크
            const radio = document.querySelector('input[name="gender"][value="' + value + '"]')
            if (radio) radio.checked = true
            
            // 시각적 피드백
            const label = event.currentTarget
            label.classList.add('selecting')
            
            // 에러 메시지 숨기기
            document.getElementById('genderError').classList.add('hidden')
            
            // 데이터 저장
            formData.gender = value
            
            // 0.5초 후 자동으로 다음 단계로
            setTimeout(() => {
                label.classList.remove('selecting')
                goToStep(4)
            }, 500)
        }

        // 교급 선택 후 자동 진행
        function selectGradeAndProceed(value, event) {
            event.preventDefault()
            
            // 라디오 버튼 체크
            const radio = document.querySelector('input[name="grade"][value="' + value + '"]')
            if (radio) radio.checked = true
            
            // 시각적 피드백
            const label = event.currentTarget
            label.classList.add('selecting')
            
            // 에러 메시지 숨기기
            document.getElementById('gradeError').classList.add('hidden')
            
            // 데이터 저장
            formData.grade = value
            
            // 0.5초 후 자동으로 다음 단계로
            setTimeout(() => {
                label.classList.remove('selecting')
                goToStep(5)
            }, 500)
        }

        // Step 전환 함수
        function goToStep(step) {
            // 유효성 검증
            if (step === 2) {
                // Step 1 → 2: 동의는 버튼 클릭으로 간주 (별도 검증 불필요)
            } else if (step === 3) {
                // Step 2 → 3: 이름 입력
                const name = document.getElementById('name').value.trim()
                if (!name) {
                    document.getElementById('nameError').classList.remove('hidden')
                    return
                }
                formData.name = name
                document.getElementById('nameError').classList.add('hidden')
            } else if (step === 4) {
                // Step 3 → 4: 성별 선택
                const gender = document.querySelector('input[name="gender"]:checked')?.value
                if (!gender) {
                    document.getElementById('genderError').classList.remove('hidden')
                    return
                }
                formData.gender = gender
                document.getElementById('genderError').classList.add('hidden')
            } else if (step === 5) {
                // Step 4 → 5: 교급 선택
                const grade = document.querySelector('input[name="grade"]:checked')?.value
                if (!grade) {
                    document.getElementById('gradeError').classList.remove('hidden')
                    return
                }
                formData.grade = grade
                document.getElementById('gradeError').classList.add('hidden')
            }

            // Section 전환
            clearValidationHints()
            showSection(\`section\${step}\`)
            updateProgress(step)
            
            // 현재 스텝 업데이트 (페이지 이탈 경고용)
            currentStep = step
        }

        function showSection(sectionId) {
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active')
            })
            document.getElementById(sectionId).classList.add('active')
        }

        // 폼 제출 (오프라인 모드 지원)
        async function submitForm() {
            // 년/월/일 개별 검증
            const year = document.getElementById('birthYear').value
            const month = document.getElementById('birthMonth').value
            const day = document.getElementById('birthDay').value
            
            const errorDiv = document.getElementById('dateError')
            const errorText = document.getElementById('dateErrorText')
            
            if (!year) {
                errorText.textContent = '년도를 선택해주세요.'
                errorDiv.classList.remove('hidden')
                return
            }
            if (!month) {
                errorText.textContent = '월을 선택해주세요.'
                errorDiv.classList.remove('hidden')
                return
            }
            if (!day) {
                errorText.textContent = '일을 선택해주세요.'
                errorDiv.classList.remove('hidden')
                return
            }
            
            // YYYY-MM-DD 형식으로 조합
            const dateOfBirth = year + '-' + month + '-' + day
            formData.dateOfBirth = dateOfBirth
            errorDiv.classList.add('hidden')

            // 제출 버튼 비활성화
            const submitBtn = document.getElementById('submitBtn')
            submitBtn.disabled = true
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>제출 중...'

            // 참가자 데이터
            const participantData = {
                booth_id: boothId,
                name: formData.name,
                gender: formData.gender,
                grade: formData.grade,
                date_of_birth: formData.dateOfBirth,
                has_consented: true
            }

            try {
                // 온라인 상태 확인
                const isOnline = syncManager.isNetworkOnline()
                
                if (!isOnline) {
                    // 오프라인 모드 - IndexedDB에 저장
                    console.log('[Guestbook] Offline mode: Saving to local storage')
                    await offlineDB.addPendingParticipant(participantData)
                    
                    // 성공 메시지 표시
                    clearValidationHints()
                    showSection('section6')
                    updateProgress(6)
                    currentStep = 6
                    isFormCompleted = true
                    
                    // 오프라인 저장 안내 메시지
                    syncManager.showNotification(
                        '오프라인 상태입니다. 데이터가 로컬에 저장되었으며, 온라인 시 자동 전송됩니다.',
                        'warning'
                    )
                    
                    // 3초 후 새로고침
                    setTimeout(() => {
                        window.location.reload()
                    }, 3000)
                    
                    return
                }
                
                // 온라인 모드 - 서버로 직접 전송
                const response = await fetch('/api/participants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(participantData)
                })

                // 응답 텍스트를 먼저 확인
                const responseText = await response.text()
                
                // JSON 파싱 시도
                let data
                try {
                    data = JSON.parse(responseText)
                } catch (jsonError) {
                    console.error('JSON 파싱 실패:', jsonError)
                    console.error('서버 응답:', responseText)
                    
                    // 파싱 실패 시 오프라인 저장으로 폴백
                    console.log('[Guestbook] Server error: Falling back to offline storage')
                    await offlineDB.addPendingParticipant(participantData)
                    
                    clearValidationHints()
                    showSection('section6')
                    updateProgress(6)
                    currentStep = 6
                    isFormCompleted = true
                    
                    syncManager.showNotification(
                        '서버 오류가 발생했습니다. 데이터가 로컬에 저장되었으며, 나중에 자동 전송됩니다.',
                        'warning'
                    )
                    
                    setTimeout(() => {
                        window.location.reload()
                    }, 3000)
                    
                    return
                }

                if (!response.ok) {
                    // 중복 등록 체크 (409 Conflict)
                    if (response.status === 409 && data.duplicate) {
                        console.log('[Guestbook] Duplicate registration detected')
                        
                        // 중복 등록 에러 메시지 표시
                        const errorDiv = document.getElementById('dateError')
                        const errorText = document.getElementById('dateErrorText')
                        
                        errorText.textContent = data.error || '이미 등록된 참가자입니다.'
                        errorDiv.classList.remove('hidden')
                        
                        // 제출 버튼 활성화
                        submitBtn.disabled = false
                        submitBtn.innerHTML = '제출하기 <i class="fas fa-check ml-2"></i>'
                        
                        // 알림 표시
                        syncManager.showNotification(
                            data.error || '이미 등록된 참가자입니다.',
                            'error'
                        )
                        
                        return
                    }
                    
                    // 기타 서버 오류 - 오프라인 저장으로 폴백
                    console.log('[Guestbook] Server error:', data.error)
                    await offlineDB.addPendingParticipant(participantData)
                    
                    clearValidationHints()
                    showSection('section6')
                    updateProgress(6)
                    currentStep = 6
                    isFormCompleted = true
                    
                    syncManager.showNotification(
                        '서버 오류가 발생했습니다. 데이터가 로컬에 저장되었으며, 나중에 자동 전송됩니다.',
                        'warning'
                    )
                    
                    setTimeout(() => {
                        window.location.reload()
                    }, 3000)
                    
                    return
                }

                // 성공 - 큐 정보 확인
                const queueInfo = data.queue
                
                // 작성 완료 플래그 설정 (페이지 이탈 경고 비활성화)
                isFormCompleted = true
                
                // QR 코드로 접속했는지 확인
                const isFromQR = urlParams.get('from') === 'qr'
                
                // QR 접속이고 큐 정보가 있으면 큐 티켓 페이지로 리다이렉트
                if (isFromQR && queueInfo && queueInfo.queue_id) {
                    const redirectParams = new URLSearchParams({
                        queue_id: queueInfo.queue_id.toString()
                    })
                    
                    // 재방문 정보 추가
                    if (data.is_revisit && data.previous_booth) {
                        redirectParams.append('is_revisit', 'true')
                        redirectParams.append('previous_booth', data.previous_booth)
                    }
                    
                    // 즉시 큐 티켓 페이지로 이동
                    window.location.href = '/queue-ticket?' + redirectParams.toString()
                    return
                }
                
                // 직접 접속이거나 큐 정보가 없으면 완료 화면 표시 후 리셋
                clearValidationHints()
                showSection('section6')
                updateProgress(6)
                currentStep = 6
                
                // 재방문 메시지 표시
                if (data.is_revisit && data.previous_booth) {
                    const heading = document.getElementById('step6-heading')
                    heading.innerHTML = '다시 방문해주셔서 감사합니다! 🎉'
                    
                    const messagePara = document.querySelector('#section6 p.text-gray-600')
                    if (messagePara) {
                        messagePara.innerHTML = \`
                            소중한 시간 내어 방명록을 작성해주셔서 감사합니다.<br>
                            <strong class="text-purple-600">[이전 방문] \${data.previous_booth}</strong><br>
                            <strong>즐거운 시간 되세요!</strong> 🎉
                        \`
                    }
                }
                
                // 3초 후 방명록 첫 화면으로 리셋 (다음 참가자 작성 가능)
                setTimeout(() => {
                    // 현재 booth_id 유지하면서 첫 화면으로
                    window.location.href = '/guestbook?booth_id=' + boothId
                }, 3000)
            } catch (error) {
                console.error('참가자 등록 실패:', error)
                
                // 네트워크 오류 - 오프라인 저장으로 폴백
                try {
                    console.log('[Guestbook] Network error: Falling back to offline storage')
                    await offlineDB.addPendingParticipant(participantData)
                    
                    clearValidationHints()
                    showSection('section6')
                    updateProgress(6)
                    currentStep = 6
                    isFormCompleted = true
                    
                    syncManager.showNotification(
                        '네트워크 오류가 발생했습니다. 데이터가 로컬에 저장되었으며, 온라인 시 자동 전송됩니다.',
                        'warning'
                    )
                    
                    setTimeout(() => {
                        window.location.reload()
                    }, 3000)
                } catch (offlineError) {
                    console.error('오프라인 저장 실패:', offlineError)
                    alert('등록에 실패했습니다. 브라우저 설정을 확인해주세요.')
                    
                    submitBtn.disabled = false
                    submitBtn.innerHTML = '제출하기 <i class="fas fa-check ml-2"></i>'
                }
            }
        }
        
        // Service Worker 등록 (PWA)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js')
                    console.log('[SW] Service Worker registered:', registration.scope)
                    
                    // 업데이트 확인
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        console.log('[SW] New Service Worker found')
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[SW] New Service Worker available')
                                // 새 버전 알림 (선택사항)
                            }
                        })
                    })
                } catch (error) {
                    console.error('[SW] Service Worker registration failed:', error)
                }
            })
        }
    </script>
</body>
</html>
`
