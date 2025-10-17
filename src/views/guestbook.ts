/**
 * 방명록 작성 폼 페이지
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
        .radio-card input:checked + div {
            border-color: #667eea;
            background: #f0f4ff;
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

        <!-- 단계 표시기 -->
        <div class="flex justify-between mb-8 px-4">
            <div class="flex flex-col items-center flex-1">
                <div class="step-indicator step-active w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2" id="step1">
                    1
                </div>
                <span class="text-sm text-gray-600">개인정보 동의</span>
            </div>
            <div class="flex-1 flex items-start justify-center pt-6">
                <div class="h-1 bg-gray-300 w-full" id="progress1"></div>
            </div>
            <div class="flex flex-col items-center flex-1">
                <div class="step-indicator step-inactive w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2" id="step2">
                    2
                </div>
                <span class="text-sm text-gray-600">정보 입력</span>
            </div>
            <div class="flex-1 flex items-start justify-center pt-6">
                <div class="h-1 bg-gray-300 w-full" id="progress2"></div>
            </div>
            <div class="flex flex-col items-center flex-1">
                <div class="step-indicator step-inactive w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2" id="step3">
                    3
                </div>
                <span class="text-sm text-gray-600">완료</span>
            </div>
        </div>

        <!-- 메인 카드 -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <!-- Step 1: 개인정보 수집 동의 -->
            <div id="section1" class="form-section active">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-shield-alt text-purple-600 mr-2"></i>
                    개인정보 수집 및 활용 동의
                </h2>
                
                <div class="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
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
                    <input type="checkbox" id="consent" class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500">
                    <span class="text-gray-800 font-medium">위 내용을 확인하였으며, 개인정보 수집 및 활용에 동의합니다.</span>
                </label>

                <div id="consentError" class="hidden mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    개인정보 수집 및 활용에 동의해주세요.
                </div>

                <button onclick="goToStep2()" class="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                    다음 단계
                    <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>

            <!-- Step 2: 정보 입력 -->
            <div id="section2" class="form-section">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-user-edit text-purple-600 mr-2"></i>
                    참가자 정보 입력
                </h2>

                <form id="participantForm" class="space-y-6">
                    <!-- 이름 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-id-card mr-2"></i>이름 <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="name" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="홍길동">
                    </div>

                    <!-- 성별 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-3">
                            <i class="fas fa-venus-mars mr-2"></i>성별 <span class="text-red-500">*</span>
                        </label>
                        <div class="grid grid-cols-3 gap-3">
                            <label class="radio-card">
                                <input type="radio" name="gender" value="남성" required class="hidden">
                                <div class="p-4 border-2 border-gray-200 rounded-lg text-center">
                                    <i class="fas fa-mars text-2xl text-blue-500 mb-2"></i>
                                    <div class="font-medium">남성</div>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" name="gender" value="여성" required class="hidden">
                                <div class="p-4 border-2 border-gray-200 rounded-lg text-center">
                                    <i class="fas fa-venus text-2xl text-pink-500 mb-2"></i>
                                    <div class="font-medium">여성</div>
                                </div>
                            </label>
                            <label class="radio-card">
                                <input type="radio" name="gender" value="기타" required class="hidden">
                                <div class="p-4 border-2 border-gray-200 rounded-lg text-center">
                                    <i class="fas fa-genderless text-2xl text-gray-500 mb-2"></i>
                                    <div class="font-medium">기타</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- 교급 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-graduation-cap mr-2"></i>교급 <span class="text-red-500">*</span>
                        </label>
                        <select id="grade" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">선택해주세요</option>
                            <option value="초등">초등학생</option>
                            <option value="중등">중학생</option>
                            <option value="고등">고등학생</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    <!-- 생년월일 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-calendar-alt mr-2"></i>생년월일 <span class="text-red-500">*</span>
                        </label>
                        <input type="date" id="dateOfBirth" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            max="">
                    </div>

                    <div id="formError" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="formErrorText"></span>
                    </div>

                    <div class="flex gap-3">
                        <button type="button" onclick="goToStep1()"
                            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl transition">
                            <i class="fas fa-arrow-left mr-2"></i>
                            이전
                        </button>
                        <button type="submit"
                            class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                            제출하기
                            <i class="fas fa-check ml-2"></i>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Step 3: 완료 -->
            <div id="section3" class="form-section text-center">
                <div class="mb-6">
                    <div class="inline-block p-6 bg-green-100 rounded-full mb-4">
                        <i class="fas fa-check-circle text-green-600 text-6xl"></i>
                    </div>
                </div>
                
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                    방명록 작성 완료!
                </h2>
                
                <p class="text-gray-600 mb-8">
                    소중한 시간 내어 방명록을 작성해주셔서 감사합니다.<br>
                    즐거운 시간 되세요!
                </p>

                <div class="bg-purple-50 p-6 rounded-lg mb-6">
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-info-circle text-purple-600 mr-2"></i>
                        3초 후 자동으로 페이지가 이동됩니다.
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

        // Step 전환 함수
        function goToStep1() {
            showSection('section1')
            updateStepIndicator(1)
        }

        function goToStep2() {
            const consent = document.getElementById('consent').checked
            if (!consent) {
                document.getElementById('consentError').classList.remove('hidden')
                return
            }
            document.getElementById('consentError').classList.add('hidden')
            showSection('section2')
            updateStepIndicator(2)
        }

        function goToStep3() {
            showSection('section3')
            updateStepIndicator(3)
            
            // 3초 후 메인으로 이동
            setTimeout(() => {
                window.location.href = '/'
            }, 3000)
        }

        function showSection(sectionId) {
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active')
            })
            document.getElementById(sectionId).classList.add('active')
        }

        function updateStepIndicator(step) {
            // Reset all steps
            for (let i = 1; i <= 3; i++) {
                const stepEl = document.getElementById(\`step\${i}\`)
                stepEl.classList.remove('step-active', 'step-completed', 'step-inactive')
                
                if (i < step) {
                    stepEl.classList.add('step-completed')
                    stepEl.innerHTML = '<i class="fas fa-check"></i>'
                } else if (i === step) {
                    stepEl.classList.add('step-active')
                    stepEl.textContent = i
                } else {
                    stepEl.classList.add('step-inactive')
                    stepEl.textContent = i
                }
            }

            // Update progress bars
            const progress1 = document.getElementById('progress1')
            const progress2 = document.getElementById('progress2')
            
            if (step >= 2) {
                progress1.classList.remove('bg-gray-300')
                progress1.classList.add('bg-green-500')
            } else {
                progress1.classList.add('bg-gray-300')
                progress1.classList.remove('bg-green-500')
            }

            if (step >= 3) {
                progress2.classList.remove('bg-gray-300')
                progress2.classList.add('bg-green-500')
            } else {
                progress2.classList.add('bg-gray-300')
                progress2.classList.remove('bg-green-500')
            }
        }

        // 폼 제출
        document.getElementById('participantForm').addEventListener('submit', async (e) => {
            e.preventDefault()

            const name = document.getElementById('name').value
            const gender = document.querySelector('input[name="gender"]:checked')?.value
            const grade = document.getElementById('grade').value
            const dateOfBirth = document.getElementById('dateOfBirth').value

            // 유효성 검증
            if (!name || !gender || !grade || !dateOfBirth) {
                document.getElementById('formErrorText').textContent = '모든 필수 항목을 입력해주세요.'
                document.getElementById('formError').classList.remove('hidden')
                return
            }

            document.getElementById('formError').classList.add('hidden')

            // 제출 버튼 비활성화
            const submitBtn = e.target.querySelector('button[type="submit"]')
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
                        name,
                        gender,
                        grade,
                        date_of_birth: dateOfBirth,
                        has_consented: true
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || '등록에 실패했습니다.')
                }

                // 성공 - Step 3으로 이동
                goToStep3()
            } catch (error) {
                console.error('참가자 등록 실패:', error)
                document.getElementById('formErrorText').textContent = error.message
                document.getElementById('formError').classList.remove('hidden')
                
                submitBtn.disabled = false
                submitBtn.innerHTML = '제출하기 <i class="fas fa-check ml-2"></i>'
            }
        })
    </script>
</body>
</html>
`
