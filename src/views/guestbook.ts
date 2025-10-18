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
    <style>
        body, html {
            overflow-x: hidden;
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
            display: none !important;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            opacity: 0;
            visibility: hidden;
        }
        .form-section.active {
            display: flex !important;
            position: relative;
            opacity: 1;
            visibility: visible;
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
            min-height: 500px;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen p-4">
    <div class="max-w-2xl mx-auto py-8">
        <!-- 헤더 -->
        <div class="text-center mb-8">
            <div class="inline-block p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
                <i class="fas fa-pen-fancy text-white text-4xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">방명록 작성</h1>
            <p class="text-gray-600" id="boothName">부스명을 불러오는 중...</p>
        </div>

        <!-- 진행률 바 -->
        <div class="mb-6" role="progressbar" aria-valuenow="17" aria-valuemin="0" aria-valuemax="100" aria-label="방명록 작성 진행률">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span id="stepText">1 / 6 단계</span>
                <span id="stepPercent">17%</span>
            </div>
            <div class="progress-bar">
                <div id="progressFill" class="progress-fill" style="width: 17%"></div>
            </div>
        </div>

        <!-- 메인 카드 -->
        <div class="bg-white rounded-2xl shadow-xl p-8 main-card flex flex-col" role="main">
            <!-- Step 1: 개인정보 수집 동의 -->
            <div id="section1" class="form-section active flex-1 flex flex-col" role="region" aria-labelledby="step1-heading">
                <h2 id="step1-heading" class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-shield-alt text-purple-600 mr-2" aria-hidden="true"></i>
                    개인정보 수집 및 활용 동의
                </h2>
                
                <div class="bg-gray-50 p-6 rounded-lg mb-6 flex-1 overflow-y-auto">
                    <h3 class="font-semibold text-gray-800 mb-3">1. 수집하는 개인정보 항목</h3>
                    <p class="text-gray-600 mb-4">이름, 성별, 교급, 생년월일</p>

                    <h3 class="font-semibold text-gray-800 mb-3">2. 개인정보의 수집 및 이용 목적</h3>
                    <p class="text-gray-600 mb-4">
                        - 행사 참가자 현황 파악<br>
                        - 통계 분석 및 행사 개선<br>
                        - 참가자 관리
                    </p>

                    <h3 class="font-semibold text-gray-800 mb-3">3. 개인정보의 보유 및 이용 기간</h3>
                    <p class="text-gray-600 mb-4">
                        수집일로부터 <strong>90일</strong> 후 자동 파기
                    </p>

                    <h3 class="font-semibold text-gray-800 mb-3">4. 동의 거부 권리</h3>
                    <p class="text-gray-600">
                        귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다.<br>
                        단, 동의하지 않을 경우 방명록 작성이 제한됩니다.
                    </p>
                </div>

                <label class="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition">
                    <input type="checkbox" id="consent" class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 focus:ring-offset-2" 
                        aria-required="true" aria-describedby="consentError">
                    <span class="text-gray-800 font-medium">위 내용을 확인하였으며, 개인정보 수집 및 활용에 동의합니다.</span>
                </label>

                <div id="consentError" class="hidden mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm" role="alert" aria-live="polite">
                    <i class="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
                    개인정보 수집 및 활용에 동의해주세요.
                </div>

                <button onclick="goToStep(2)" class="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                    aria-label="다음 단계로 이동">
                    다음 단계
                    <i class="fas fa-arrow-right ml-2" aria-hidden="true"></i>
                </button>
            </div>

            <!-- Step 2: 이름 -->
            <div id="section2" class="form-section flex-1 flex flex-col justify-center" role="region" aria-labelledby="step2-heading">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-purple-100 rounded-full mb-4" aria-hidden="true">
                        <i class="fas fa-id-card text-purple-600 text-5xl"></i>
                    </div>
                    <h2 id="step2-heading" class="text-3xl font-bold text-gray-800 mb-2">이름을 알려주세요</h2>
                    <p class="text-gray-600">본인의 실명을 입력해주세요</p>
                </div>

                <div class="mb-8">
                    <label for="name" class="sr-only">이름</label>
                    <input type="text" id="name" 
                        class="w-full px-6 py-4 text-xl text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent"
                        placeholder="예: 홍길동"
                        autocomplete="name"
                        aria-required="true"
                        aria-describedby="nameError">
                    <div id="nameError" class="hidden mt-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center" role="alert" aria-live="polite">
                        <i class="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
                        이름을 입력해주세요.
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="goToStep(1)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left mr-2" aria-hidden="true"></i>이전
                    </button>
                    <button onclick="goToStep(3)" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="다음 단계로 이동">
                        다음 <i class="fas fa-arrow-right ml-2" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Step 3: 성별 -->
            <div id="section3" class="form-section flex-1 flex flex-col justify-center" role="region" aria-labelledby="step3-heading">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-purple-100 rounded-full mb-4" aria-hidden="true">
                        <i class="fas fa-venus-mars text-purple-600 text-5xl"></i>
                    </div>
                    <h2 id="step3-heading" class="text-3xl font-bold text-gray-800 mb-2">성별을 선택해주세요</h2>
                    <p class="text-gray-600">통계 자료로 활용됩니다</p>
                </div>

                <fieldset class="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto" aria-required="true" aria-describedby="genderError">
                    <legend class="sr-only">성별 선택</legend>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="gender" value="남성" class="sr-only" aria-label="남성">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-mars text-5xl text-blue-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">남성</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="gender" value="여성" class="sr-only" aria-label="여성">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-venus text-5xl text-pink-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">여성</div>
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
            <div id="section4" class="form-section flex-1 flex flex-col justify-center" role="region" aria-labelledby="step4-heading">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-purple-100 rounded-full mb-4" aria-hidden="true">
                        <i class="fas fa-graduation-cap text-purple-600 text-5xl"></i>
                    </div>
                    <h2 id="step4-heading" class="text-3xl font-bold text-gray-800 mb-2">학교급을 선택해주세요</h2>
                    <p class="text-gray-600">현재 재학 중이신 학교급을 선택해주세요</p>
                </div>

                <fieldset class="grid grid-cols-2 gap-4 mb-8" aria-required="true" aria-describedby="gradeError">
                    <legend class="sr-only">학교급 선택</legend>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="grade" value="유아" class="sr-only" aria-label="유아">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-baby text-5xl text-yellow-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">유아</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="grade" value="초등" class="sr-only" aria-label="초등학생">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-child text-5xl text-green-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">초등학생</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="grade" value="중등" class="sr-only" aria-label="중학생">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-user-graduate text-5xl text-blue-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">중학생</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="grade" value="고등" class="sr-only" aria-label="고등학생">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-graduation-cap text-5xl text-purple-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">고등학생</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="grade" value="성인" class="sr-only" aria-label="성인">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-user-tie text-5xl text-indigo-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">성인</div>
                        </div>
                    </label>
                    <label class="radio-card" tabindex="0">
                        <input type="radio" name="grade" value="기타" class="sr-only" aria-label="기타">
                        <div class="p-6 border-2 border-gray-200 rounded-xl text-center focus-within:ring-4 focus-within:ring-purple-300">
                            <i class="fas fa-user text-5xl text-gray-500 mb-3" aria-hidden="true"></i>
                            <div class="font-semibold text-lg">기타</div>
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
            <div id="section5" class="form-section flex-1 flex flex-col justify-center" role="region" aria-labelledby="step5-heading">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-purple-100 rounded-full mb-4" aria-hidden="true">
                        <i class="fas fa-calendar-alt text-purple-600 text-5xl"></i>
                    </div>
                    <h2 id="step5-heading" class="text-3xl font-bold text-gray-800 mb-2">생년월일을 입력해주세요</h2>
                    <p class="text-gray-600">통계 자료로 활용됩니다</p>
                </div>

                <div class="mb-8">
                    <label for="dateOfBirth" class="sr-only">생년월일</label>
                    <input type="date" id="dateOfBirth" 
                        class="w-full px-6 py-4 text-xl text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent"
                        max=""
                        aria-required="true"
                        aria-describedby="dateError">
                    <div id="dateError" class="hidden mt-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center" role="alert" aria-live="polite">
                        <i class="fas fa-exclamation-circle mr-2" aria-hidden="true"></i>
                        생년월일을 선택해주세요.
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="goToStep(4)" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                        aria-label="이전 단계로 돌아가기">
                        <i class="fas fa-arrow-left mr-2" aria-hidden="true"></i>이전
                    </button>
                    <button onclick="submitForm()" id="submitBtn" class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                        aria-label="방명록 제출">
                        제출하기 <i class="fas fa-check ml-2" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <!-- Step 6: 완료 -->
            <div id="section6" class="form-section flex-1 flex flex-col justify-center text-center" role="region" aria-labelledby="step6-heading" aria-live="polite">
                <div class="mb-6">
                    <div class="inline-block p-6 bg-green-100 rounded-full mb-4 animate-bounce" aria-hidden="true">
                        <i class="fas fa-check-circle text-green-600 text-6xl"></i>
                    </div>
                </div>
                
                <h2 id="step6-heading" class="text-3xl font-bold text-gray-800 mb-4">
                    등록 완료!
                </h2>
                
                <p class="text-gray-600 mb-8">
                    소중한 시간 내어 방명록을 작성해주셔서 감사합니다.<br>
                    <strong>즐거운 시간 되세요!</strong> 🎉
                </p>

                <div class="bg-purple-50 p-6 rounded-lg" role="status">
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-info-circle text-purple-600 mr-2" aria-hidden="true"></i>
                        3초 후 자동으로 새로고침됩니다.<br>
                        <span class="text-xs text-gray-500 mt-1 block">다음 참가자도 작성 가능합니다</span>
                    </p>
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

        // 오늘 날짜를 max로 설정
        document.getElementById('dateOfBirth').max = new Date().toISOString().split('T')[0]

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

        // Step 전환 함수
        function goToStep(step) {
            // 유효성 검증
            if (step === 2) {
                // Step 1 → 2: 동의 체크
                const consent = document.getElementById('consent').checked
                if (!consent) {
                    document.getElementById('consentError').classList.remove('hidden')
                    return
                }
                document.getElementById('consentError').classList.add('hidden')
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
            const dateOfBirth = document.getElementById('dateOfBirth').value
            if (!dateOfBirth) {
                document.getElementById('dateError').classList.remove('hidden')
                return
            }
            formData.dateOfBirth = dateOfBirth
            document.getElementById('dateError').classList.add('hidden')

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

                const data = await response.json()

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
