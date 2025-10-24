/**
 * 방명록 작성 폼 페이지 (한 페이지에 한 질문씩)
 */

export const guestbookPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>방명록 작성 - 제미나이 부스</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <style>
        body, html {
            overflow: hidden;
            height: 100vh;
            width: 100vw;
        }
        
        /* 스크린 리더 전용 텍스트 */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
        
        /* 포커스 스타일 개선 */
        *:focus-visible {
            outline: 3px solid #667eea;
            outline-offset: 2px;
        }
        
        button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.5);
        }
        
        input:focus-visible, select:focus-visible {
            outline: none;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
        }
        
        .step-indicator {
            transition: all 0.3s ease;
        }
        .step-active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .step-completed {
            background: #10b981;
            color: white;
        }
        .step-inactive {
            background: #e5e7eb;
            color: #9ca3af;
        }
        .form-section {
            display: none;
        }
        .form-section.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .radio-card {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .radio-card:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .radio-card:focus-within {
            transform: scale(1.02);
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
        }
        .radio-card input:checked + div {
            border-color: #667eea;
            background: #f0f4ff;
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
            top: 10px;
            right: 10px;
            color: #10b981;
            font-size: 1.5rem;
        }
        .radio-card.selecting .check-icon {
            display: block;
            animation: checkFadeIn 0.3s ease-in-out;
        }
        @keyframes checkFadeIn {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
        }
        .progress-bar {
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }
        .main-card {
            position: relative;
        }
        
        /* 뷰포트 높이 기반 레이아웃 */
        .container-wrapper {
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow-y: auto;
            padding: 1rem 0;
        }
        
        /* 모바일 최적화 */
        @media (max-width: 640px) {
            .content-area {
                padding: 0.5rem 0;
            }
            h2 {
                font-size: 1.25rem !important;
            }
            .text-lg {
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
<body class="bg-gradient-to-br from-purple-50 to-pink-50">
    <!-- 우측 상단 작은 QR 코드 -->
    <div class="qr-code-small" onclick="openQRModal()" title="QR 코드 크게 보기">
        <div class="bg-white rounded-xl shadow-lg p-2 border-2 border-purple-300">
            <div id="qrCodeSmall"></div>
        </div>
    </div>

    <!-- QR 코드 확대 모달 -->
    <div id="qrModal" class="qr-modal" onclick="closeQRModal()">
        <div class="qr-modal-content" onclick="event.stopPropagation()">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-qrcode text-purple-600 mr-2"></i>
                방명록 QR 코드
            </h3>
            <div id="qrCodeLarge" class="mx-auto mb-4" style="display: flex; justify-content: center;"></div>
            <p class="text-gray-700 mb-4">
                QR 코드를 스캔하면<br>
                자동으로 방명록 작성 페이지로 이동합니다.
            </p>
            <button onclick="copyGuestbookLink()" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition mb-2 inline-flex items-center gap-2">
                <i class="fas fa-copy"></i>
                링크 복사
            </button>
            <p id="copySuccessModal" class="text-green-600 text-sm hidden">
                <i class="fas fa-check-circle"></i> 복사되었습니다!
            </p>
            <button onclick="closeQRModal()" class="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                <i class="fas fa-times mr-2"></i>닫기
            </button>
        </div>
    </div>

    <div class="container-wrapper max-w-2xl mx-auto px-4">
        <!-- 헤더 (컴팩트) -->
        <div class="compact-spacing py-3">
            <!-- 뒤로가기 버튼 -->
            <button onclick="goBack()" 
                class="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition group">
                <i class="fas fa-arrow-left text-lg group-hover:-translate-x-1 transition-transform"></i>
                <span class="text-sm font-medium">뒤로가기</span>
            </button>
            
            <div class="text-center py-2">
                <div class="inline-block p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-2">
                    <i class="fas fa-pen-fancy text-white text-2xl"></i>
                </div>
                <h1 class="text-xl font-bold text-gray-800 mb-1">방명록 작성</h1>
                <p class="text-sm text-gray-600" id="boothName">부스명을 불러오는 중...</p>
            </div>
        </div>

        <!-- 진행률 바 -->
        <div class="compact-spacing" role="progressbar" aria-valuenow="17" aria-valuemin="0" aria-valuemax="100" aria-label="방명록 작성 진행률">
            <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span id="stepText">1 / 6 단계</span>
                <span id="stepPercent">17%</span>
            </div>
            <div class="progress-bar">
                <div id="progressFill" class="progress-fill" style="width: 17%"></div>
            </div>
        </div>

        <!-- 메인 카드 -->
        <div class="content-area">
            <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 main-card" role="main">
            <!-- Step 1: 개인정보 수집 동의 -->
            <div id="section1" class="form-section active" role="region" aria-labelledby="step1-heading">
                <div class="text-center mb-4">
                    <div class="inline-block p-3 bg-purple-100 rounded-full mb-2" aria-hidden="true">
                        <i class="fas fa-shield-alt text-purple-600 text-3xl"></i>
                    </div>
                    <h2 id="step1-heading" class="text-2xl font-bold text-gray-800 mb-1">개인정보 수집 동의</h2>
                    <p class="text-sm text-gray-600">방명록 작성을 위해 동의가 필요합니다</p>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl mb-4">
                    <div class="space-y-2 text-sm text-gray-700">
                        <div class="flex items-start space-x-2">
                            <i class="fas fa-check-circle text-purple-600 mt-0.5 text-xs" aria-hidden="true"></i>
                            <div>
                                <strong>수집 항목:</strong> 이름, 성별, 교급, 생년월일
                            </div>
                        </div>
                        <div class="flex items-start space-x-2">
                            <i class="fas fa-check-circle text-purple-600 mt-0.5 text-xs" aria-hidden="true"></i>
                            <div>
                                <strong>이용 목적:</strong> 행사 참가자 현황 파악 및 통계 분석
                            </div>
                        </div>
                        <div class="flex items-start space-x-2">
                            <i class="fas fa-check-circle text-purple-600 mt-0.5 text-xs" aria-hidden="true"></i>
                            <div>
                                <strong>보유 기간:</strong> 수집일로부터 90일 후 자동 파기
                            </div>
                        </div>
                    </div>
                    
                    <!-- 상세 내용 펼치기 (선택적) -->
                    <button type="button" onclick="togglePrivacyDetails()" class="mt-3 text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center mx-auto">
                        <span id="privacyToggleText">상세 내용 보기</span>
                        <i id="privacyToggleIcon" class="fas fa-chevron-down ml-1 text-xs" aria-hidden="true"></i>
                    </button>
                    
                    <div id="privacyDetails" class="hidden mt-3 pt-3 border-t border-purple-200 text-xs text-gray-600">
                        <h3 class="font-semibold text-gray-800 mb-1">동의 거부 권리</h3>
                        <p>귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다. 단, 동의하지 않을 경우 방명록 작성이 제한됩니다.</p>
                    </div>
                </div>

                <!-- 큰 버튼형 동의 -->
                <button type="button" onclick="agreeAndProceed()" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                    aria-label="개인정보 수집 및 활용에 동의하고 다음 단계로 이동">
                    <i class="fas fa-check-circle mr-2" aria-hidden="true"></i>
                    동의하고 시작하기
                </button>
                
                <p class="mt-2 text-center text-xs text-gray-500">
                    버튼을 클릭하면 개인정보 수집 및 활용에 동의한 것으로 간주됩니다
                </p>
            </div>

            <!-- Step 2: 이름 -->
            <div id="section2" class="form-section" role="region" aria-labelledby="step2-heading">
                <div class="text-center mb-4">
                    <div class="inline-block p-3 bg-purple-100 rounded-full mb-2" aria-hidden="true">
                        <i class="fas fa-id-card text-purple-600 text-3xl"></i>
                    </div>
                    <h2 id="step2-heading" class="text-2xl font-bold text-gray-800 mb-1">이름을 알려주세요</h2>
                    <p class="text-sm text-gray-600">본인의 실명을 입력해주세요</p>
                </div>

                <div class="mb-4">
                    <label for="name" class="sr-only">이름</label>
                    <input type="text" id="name" 
                        class="w-full px-4 py-4 text-xl text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent"
                        placeholder="예: 홍길동"
                        inputmode="text"
                        autocomplete="off"
                        aria-required="true"
                        aria-describedby="nameError">
                    <div id="nameError" class="hidden mt-2 bg-red-50 text-red-600 p-2 rounded-lg text-sm text-center" role="alert" aria-live="polite">
                        <i class="fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                        이름을 입력해주세요.
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="goToStep(1)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left mr-1" aria-hidden="true"></i>이전
                    </button>
                    <button onclick="goToStep(3)" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right ml-1" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Step 3: 성별 -->
            <div id="section3" class="form-section" role="region" aria-labelledby="step3-heading">
                <div class="text-center mb-4">
                    <div class="inline-block p-3 bg-purple-100 rounded-full mb-2" aria-hidden="true">
                        <i class="fas fa-venus-mars text-purple-600 text-3xl"></i>
                    </div>
                    <h2 id="step3-heading" class="text-2xl font-bold text-gray-800 mb-1">성별을 선택해주세요</h2>
                    <p class="text-sm text-gray-600">통계 자료로 활용됩니다</p>
                </div>

                <fieldset class="grid grid-cols-2 gap-3 mb-4" aria-required="true" aria-describedby="genderError">
                    <legend class="sr-only">성별 선택</legend>
                    <label class="radio-card relative" tabindex="0" onclick="selectGenderAndProceed('남성', event)">
                        <input type="radio" name="gender" value="남성" class="sr-only" aria-label="남성">
                        <div class="p-4 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-mars text-4xl text-blue-500 mb-2" aria-hidden="true"></i>
                            <div class="font-semibold">남성</div>
                        </div>
                    </label>
                    <label class="radio-card relative" tabindex="0" onclick="selectGenderAndProceed('여성', event)">
                        <input type="radio" name="gender" value="여성" class="sr-only" aria-label="여성">
                        <div class="p-4 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-venus text-4xl text-pink-500 mb-2" aria-hidden="true"></i>
                            <div class="font-semibold">여성</div>
                        </div>
                    </label>
                </fieldset>

                <div id="genderError" class="hidden mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center" role="alert" aria-live="polite">
                    <i class="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
                    성별을 선택해주세요.
                </div>

                <div class="flex gap-3">
                    <button onclick="goToStep(2)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left mr-2" aria-hidden="true"></i>이전
                    </button>
                    <button onclick="goToStep(4)" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right ml-2" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Step 4: 교급 -->
            <div id="section4" class="form-section" role="region" aria-labelledby="step4-heading">
                <div class="text-center mb-3">
                    <div class="inline-block p-3 bg-purple-100 rounded-full mb-2" aria-hidden="true">
                        <i class="fas fa-graduation-cap text-purple-600 text-3xl"></i>
                    </div>
                    <h2 id="step4-heading" class="text-2xl font-bold text-gray-800 mb-1">학교급을 선택해주세요</h2>
                    <p class="text-sm text-gray-600">현재 재학 중이신 학교급을 선택해주세요</p>
                </div>

                <fieldset class="grid grid-cols-3 gap-2 mb-3" aria-required="true" aria-describedby="gradeError">
                    <legend class="sr-only">학교급 선택</legend>
                    <label class="radio-card relative" tabindex="0" onclick="selectGradeAndProceed('유아', event)">
                        <input type="radio" name="grade" value="유아" class="sr-only" aria-label="유아">
                        <div class="p-3 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-baby text-3xl text-yellow-500 mb-1" aria-hidden="true"></i>
                            <div class="font-semibold text-sm">유아</div>
                        </div>
                    </label>
                    <label class="radio-card relative" tabindex="0" onclick="selectGradeAndProceed('초등', event)">
                        <input type="radio" name="grade" value="초등" class="sr-only" aria-label="초등학생">
                        <div class="p-3 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-child text-3xl text-green-500 mb-1" aria-hidden="true"></i>
                            <div class="font-semibold text-sm">초등</div>
                        </div>
                    </label>
                    <label class="radio-card relative" tabindex="0" onclick="selectGradeAndProceed('중등', event)">
                        <input type="radio" name="grade" value="중등" class="sr-only" aria-label="중학생">
                        <div class="p-3 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-user-graduate text-3xl text-blue-500 mb-1" aria-hidden="true"></i>
                            <div class="font-semibold text-sm">중등</div>
                        </div>
                    </label>
                    <label class="radio-card relative" tabindex="0" onclick="selectGradeAndProceed('고등', event)">
                        <input type="radio" name="grade" value="고등" class="sr-only" aria-label="고등학생">
                        <div class="p-3 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-graduation-cap text-3xl text-purple-500 mb-1" aria-hidden="true"></i>
                            <div class="font-semibold text-sm">고등</div>
                        </div>
                    </label>
                    <label class="radio-card relative" tabindex="0" onclick="selectGradeAndProceed('성인', event)">
                        <input type="radio" name="grade" value="성인" class="sr-only" aria-label="성인">
                        <div class="p-3 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-check-circle check-icon" aria-hidden="true"></i>
                            <i class="fas fa-user-tie text-3xl text-indigo-500 mb-1" aria-hidden="true"></i>
                            <div class="font-semibold text-sm">성인</div>
                        </div>
                    </label>
                </fieldset>

                <div id="gradeError" class="hidden mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center" role="alert" aria-live="polite">
                    <i class="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
                    학교급을 선택해주세요.
                </div>

                <div class="flex gap-3">
                    <button onclick="goToStep(3)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left mr-2" aria-hidden="true"></i>이전
                    </button>
                    <button onclick="goToStep(5)" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right ml-2" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Step 5: 생년월일 -->
            <div id="section5" class="form-section" role="region" aria-labelledby="step5-heading">
                <div class="text-center mb-3">
                    <div class="inline-block p-3 bg-purple-100 rounded-full mb-2" aria-hidden="true">
                        <i class="fas fa-calendar-alt text-purple-600 text-3xl"></i>
                    </div>
                    <h2 id="step5-heading" class="text-2xl font-bold text-gray-800 mb-1">생년월일을 선택해주세요</h2>
                    <p class="text-sm text-gray-600">태블릿 환경에 최적화된 선택기입니다</p>
                </div>

                <div class="mb-4">
                    <!-- 년/월/일 분리형 선택기 -->
                    <div class="grid grid-cols-3 gap-2">
                        <!-- 년도 선택 -->
                        <div>
                            <label for="birthYear" class="block text-xs font-medium text-gray-700 mb-1 text-center">년도</label>
                            <select id="birthYear" 
                                class="w-full px-2 py-3 text-base text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent bg-white"
                                aria-required="true">
                                <option value="">선택</option>
                            </select>
                        </div>
                        
                        <!-- 월 선택 -->
                        <div>
                            <label for="birthMonth" class="block text-xs font-medium text-gray-700 mb-1 text-center">월</label>
                            <select id="birthMonth" 
                                class="w-full px-2 py-3 text-base text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent bg-white"
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
                            <label for="birthDay" class="block text-xs font-medium text-gray-700 mb-1 text-center">일</label>
                            <select id="birthDay" 
                                class="w-full px-2 py-3 text-base text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent bg-white"
                                aria-required="true">
                                <option value="">선택</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="dateError" class="hidden mt-2 bg-red-50 text-red-600 p-2 rounded-lg text-sm text-center" role="alert" aria-live="polite">
                        <i class="fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
                        <span id="dateErrorText">생년월일을 모두 선택해주세요.</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="goToStep(4)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left mr-1" aria-hidden="true"></i>이전
                    </button>
                    <button onclick="submitForm()" id="submitBtn" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="방명록 제출">
                        제출하기 <i class="fas fa-check ml-1" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Step 6: 완료 -->
            <div id="section6" class="form-section text-center" role="region" aria-labelledby="step6-heading" aria-live="polite">
                <div class="mb-4">
                    <div class="inline-block p-4 bg-green-100 rounded-full mb-3 animate-bounce" aria-hidden="true">
                        <i class="fas fa-check-circle text-green-600 text-5xl"></i>
                    </div>
                </div>
                
                <h2 id="step6-heading" class="text-2xl font-bold text-gray-800 mb-3">
                    등록 완료!
                </h2>
                
                <p class="text-gray-600 mb-4 text-sm">
                    소중한 시간 내어 방명록을 작성해주셔서 감사합니다.<br>
                    <strong>즐거운 시간 되세요!</strong> 🎉
                </p>

                <div class="bg-purple-50 p-4 rounded-lg" role="status">
                    <p class="text-xs text-gray-600">
                        <i class="fas fa-info-circle text-purple-600 mr-1" aria-hidden="true"></i>
                        3초 후 자동으로 새로고침됩니다.<br>
                        <span class="text-xs text-gray-500 mt-1 block">다음 참가자도 작성 가능합니다</span>
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

        function updateDayOptions() {
            const year = document.getElementById('birthYear').value
            const month = document.getElementById('birthMonth').value
            const daySelect = document.getElementById('birthDay')
            
            // 일 선택 초기화
            daySelect.innerHTML = '<option value="">선택</option>'
            
            if (year && month) {
                // 해당 월의 마지막 날 계산
                const lastDay = new Date(year, parseInt(month), 0).getDate()
                
                for (let day = 1; day <= lastDay; day++) {
                    const option = document.createElement('option')
                    const dayStr = day.toString().padStart(2, '0')
                    option.value = dayStr
                    option.textContent = day + '일'
                    daySelect.appendChild(option)
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
            const guestbookUrl = window.location.href
            
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

        // 폼 제출
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

            try {
                const response = await fetch('/api/participants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        booth_id: boothId,
                        name: formData.name,
                        gender: formData.gender,
                        grade: formData.grade,
                        date_of_birth: formData.dateOfBirth,
                        has_consented: true
                    })
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
                    throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.')
                }

                if (!response.ok) {
                    throw new Error(data.error || '등록에 실패했습니다.')
                }

                // 성공 - Step 6으로 이동
                showSection('section6')
                updateProgress(6)
                currentStep = 6
                
                // 작성 완료 플래그 설정 (페이지 이탈 경고 비활성화)
                isFormCompleted = true
                
                // 3초 후 페이지 새로고침 (다음 참가자 작성 가능)
                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.error('참가자 등록 실패:', error)
                alert('등록에 실패했습니다: ' + error.message)
                
                submitBtn.disabled = false
                submitBtn.innerHTML = '제출하기 <i class="fas fa-check ml-2"></i>'
            }
        }
    </script>
</body>
</html>
`
