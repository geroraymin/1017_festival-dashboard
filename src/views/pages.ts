/**
 * HTML 페이지 템플릿
 */

export const adminLoginPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 로그인 - 축제 디지털방명록 시스템</title>
    
    <!-- PWA 설정 -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#4F46E5">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <div class="text-center mb-8">
            <a href="/" class="inline-block p-3 bg-indigo-600 rounded-full mb-4 hover:bg-indigo-700 transition">
                <i class="fas fa-user-shield text-white text-4xl"></i>
            </a>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">관리자 로그인</h1>
            <p class="text-gray-600">시스템 관리자 전용</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user mr-2"></i>아이디
                    </label>
                    <input type="text" id="username" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="관리자 아이디">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2"></i>비밀번호
                    </label>
                    <input type="password" id="password" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="비밀번호">
                </div>

                <div id="errorMessage" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorText"></span>
                </div>

                <button type="submit" id="loginButton"
                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    로그인
                </button>

                <a href="/" class="block text-center text-gray-600 hover:text-indigo-600 transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    메인으로 돌아가기
                </a>
            </form>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script>
        const loginForm = document.getElementById('loginForm')
        const errorMessage = document.getElementById('errorMessage')
        const errorText = document.getElementById('errorText')
        const loginButton = document.getElementById('loginButton')

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const username = document.getElementById('username').value
            const password = document.getElementById('password').value

            errorMessage.classList.add('hidden')
            loginButton.disabled = true
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...'

            try {
                const response = await AuthAPI.adminLogin(username, password)
                
                saveToken(response.token)
                saveUser(response.user)
                
                window.location.href = '/dashboard/admin'
            } catch (error) {
                errorText.textContent = error.message
                errorMessage.classList.remove('hidden')
                
                loginButton.disabled = false
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인'
            }
        })
    </script>
</body>
</html>
`

export const operatorLoginPage = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>운영자 로그인 - 축제 디지털방명록 시스템</title>
    
    <!-- PWA 설정 -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#4F46E5">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-teal-50 to-cyan-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <div class="text-center mb-8">
            <a href="/" class="inline-block p-3 bg-teal-500 rounded-full mb-4 hover:bg-teal-600 transition">
                <i class="fas fa-users text-white text-4xl"></i>
            </a>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">부스 운영자 로그인</h1>
            <p class="text-gray-600">부스 코드를 입력하세요</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-key mr-2"></i>부스 코드 (6자리)
                    </label>
                    <input type="text" id="boothCode" required maxlength="6"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl font-mono tracking-wider uppercase"
                        placeholder="ABC123"
                        style="text-transform: uppercase">
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-700">
                        <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                        부스 코드는 관리자로부터 전달받은 6자리 코드입니다.
                    </p>
                </div>
                
                <!-- 부스 코드 찾기 링크 추가 -->
                <div class="text-center">
                    <button type="button" onclick="showBoothCodeFinder()" class="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium">
                        <i class="fas fa-search mr-1"></i>
                        부스 코드를 잊으셨나요?
                    </button>
                </div>

                <div id="errorMessage" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorText"></span>
                </div>

                <button type="submit" id="loginButton"
                    class="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    로그인
                </button>

                <a href="/" class="block text-center text-gray-600 hover:text-teal-600 transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    메인으로 돌아가기
                </a>
            </form>
        </div>
    </div>
    
    <!-- 부스 코드 찾기 모달 -->
    <div id="boothCodeFinderModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onclick="hideBoothCodeFinder()">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-search text-teal-500 mr-2"></i>
                    부스 코드 찾기
                </h2>
                <button onclick="hideBoothCodeFinder()" class="text-gray-400 hover:text-gray-600 transition">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <p class="text-gray-600 mb-4 text-sm">
                관리자에게 전화하지 말고 직접 찾아보세요!
            </p>
            
            <form id="findBoothCodeForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-calendar-alt mr-1"></i>행사 선택
                    </label>
                    <select id="eventSelectForFinder" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                        <option value="">선택하세요</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-store mr-1"></i>부스명
                    </label>
                    <input type="text" id="boothNameSearch" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="부스 이름을 입력하세요 (일부만 입력해도 됩니다)">
                </div>
                
                <div id="finderError" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="finderErrorText"></span>
                </div>
                
                <button type="submit" id="searchButton"
                    class="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                    <i class="fas fa-search mr-2"></i>
                    검색
                </button>
            </form>
            
            <!-- 검색 결과 -->
            <div id="boothCodeResult" class="hidden mt-4 space-y-3">
                <div class="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                    <i class="fas fa-check-circle text-green-600 text-3xl mb-2"></i>
                    <p class="text-gray-700 mb-2">찾은 부스 코드</p>
                    <div id="foundBoothCodes" class="space-y-2">
                        <!-- 동적으로 채워짐 -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/static/js/api.js"></script>
    <script>
        const loginForm = document.getElementById('loginForm')
        const boothCodeInput = document.getElementById('boothCode')
        const errorMessage = document.getElementById('errorMessage')
        const errorText = document.getElementById('errorText')
        const loginButton = document.getElementById('loginButton')

        // 부스 코드 자동 대문자 변환
        boothCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase()
        })

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const boothCode = boothCodeInput.value.trim()

            if (boothCode.length !== 6) {
                errorText.textContent = '부스 코드는 6자리여야 합니다.'
                errorMessage.classList.remove('hidden')
                return
            }

            errorMessage.classList.add('hidden')
            loginButton.disabled = true
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...'

            try {
                const response = await AuthAPI.operatorLogin(boothCode)
                
                saveToken(response.token)
                saveUser(response.user)
                
                window.location.href = '/dashboard/operator'
            } catch (error) {
                errorText.textContent = error.message
                errorMessage.classList.remove('hidden')
                
                loginButton.disabled = false
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>로그인'
            }
        })
        
        // === 부스 코드 찾기 기능 ===
        
        // 모달 표시
        function showBoothCodeFinder() {
            document.getElementById('boothCodeFinderModal').classList.remove('hidden')
            loadActiveEvents()
        }
        
        // 모달 숨기기
        function hideBoothCodeFinder() {
            document.getElementById('boothCodeFinderModal').classList.add('hidden')
            document.getElementById('boothCodeResult').classList.add('hidden')
            document.getElementById('findBoothCodeForm').reset()
        }
        
        // 활성화된 행사 목록 로드
        async function loadActiveEvents() {
            try {
                const response = await fetch('/api/events')
                const data = await response.json()
                
                const eventSelect = document.getElementById('eventSelectForFinder')
                eventSelect.innerHTML = '<option value="">선택하세요</option>'
                
                if (data.events && data.events.length > 0) {
                    data.events
                        .filter(event => event.is_active)
                        .forEach(event => {
                            const option = document.createElement('option')
                            option.value = event.id
                            option.textContent = event.name
                            eventSelect.appendChild(option)
                        })
                }
            } catch (error) {
                console.error('행사 목록 로드 실패:', error)
            }
        }
        
        // 부스 코드 검색 폼
        document.getElementById('findBoothCodeForm').addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const eventId = document.getElementById('eventSelectForFinder').value
            const boothName = document.getElementById('boothNameSearch').value.trim()
            const finderError = document.getElementById('finderError')
            const finderErrorText = document.getElementById('finderErrorText')
            const searchButton = document.getElementById('searchButton')
            const resultDiv = document.getElementById('boothCodeResult')
            const foundCodesDiv = document.getElementById('foundBoothCodes')
            
            if (!eventId || !boothName) {
                finderErrorText.textContent = '행사와 부스명을 모두 입력해주세요.'
                finderError.classList.remove('hidden')
                return
            }
            
            finderError.classList.add('hidden')
            resultDiv.classList.add('hidden')
            searchButton.disabled = true
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>검색 중...'
            
            try {
                const response = await fetch('/api/booths/find-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: eventId, booth_name: boothName })
                })
                
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error || '부스 코드 찾기에 실패했습니다.')
                }
                
                // 검색 결과 표시
                foundCodesDiv.innerHTML = ''
                
                if (data.booths && data.booths.length > 0) {
                    data.booths.forEach(booth => {
                        const boothCard = document.createElement('div')
                        boothCard.className = 'bg-white border-2 border-teal-200 rounded-lg p-3'
                        boothCard.innerHTML = \`
                            <p class="text-sm text-gray-600 mb-1">\${booth.name}</p>
                            <div class="flex items-center justify-between">
                                <span class="text-3xl font-mono font-bold text-teal-600">\${booth.booth_code}</span>
                                <button onclick="copyBoothCode('\${booth.booth_code}')" 
                                    class="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm transition">
                                    <i class="fas fa-copy mr-1"></i>복사
                                </button>
                            </div>
                        \`
                        foundCodesDiv.appendChild(boothCard)
                    })
                    
                    resultDiv.classList.remove('hidden')
                } else {
                    finderErrorText.textContent = '해당하는 부스를 찾을 수 없습니다.'
                    finderError.classList.remove('hidden')
                }
                
            } catch (error) {
                finderErrorText.textContent = error.message
                finderError.classList.remove('hidden')
            } finally {
                searchButton.disabled = false
                searchButton.innerHTML = '<i class="fas fa-search mr-2"></i>검색'
            }
        })
        
        // 부스 코드 복사
        function copyBoothCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                // 로그인 폼에 자동 입력
                boothCodeInput.value = code
                
                // 모달 닫기
                hideBoothCodeFinder()
                
                // 성공 메시지
                alert(\`부스 코드 \${code}가 복사되어 입력되었습니다!\\n로그인 버튼을 눌러주세요.\`)
            }).catch(err => {
                console.error('복사 실패:', err)
                alert('복사에 실패했습니다. 직접 입력해주세요.')
            })
        }
    </script>
</body>
</html>
`
