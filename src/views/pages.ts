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
    </script>
</body>
</html>
`
