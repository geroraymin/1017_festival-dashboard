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
    <meta name="theme-color" content="#007AFF">
    
    <link rel="stylesheet" href="/static/style.css">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body style="background: linear-gradient(135deg, var(--color-background-secondary), var(--color-primary-light)); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-4);">
    <div style="max-width: 28rem; width: 100%;">
        <div style="text-align: center; margin-bottom: var(--space-8);">
            <a href="/" style="display: inline-block; padding: var(--space-4); background: linear-gradient(135deg, var(--color-primary), #0051D5); border-radius: 50%; margin-bottom: var(--space-4); text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);">
                <i class="fas fa-user-shield" style="color: white; font-size: 2.5rem;"></i>
            </a>
            <h1 class="text-title1" style="color: var(--color-text-primary); margin-bottom: var(--space-2);">관리자 로그인</h1>
            <p class="text-body" style="color: var(--color-text-secondary);">시스템 관리자 전용</p>
        </div>

        <div class="card" style="padding: var(--space-8);">
            <form id="loginForm" style="display: flex; flex-direction: column; gap: var(--space-6);">
                <div>
                    <label class="text-footnote" style="display: block; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">
                        <i class="fas fa-user" style="margin-right: var(--space-2);"></i>아이디
                    </label>
                    <input type="text" id="username" required
                        class="input"
                        placeholder="관리자 아이디"
                        style="width: 100%;">
                </div>

                <div>
                    <label class="text-footnote" style="display: block; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">
                        <i class="fas fa-lock" style="margin-right: var(--space-2);"></i>비밀번호
                    </label>
                    <input type="password" id="password" required
                        class="input"
                        placeholder="비밀번호"
                        style="width: 100%;">
                </div>

                <div id="errorMessage" class="status-alert status-alert-error" style="display: none;">
                    <i class="fas fa-exclamation-circle" style="margin-right: var(--space-2);"></i>
                    <span id="errorText"></span>
                </div>

                <button type="submit" id="loginButton"
                    class="btn btn-primary btn-lg"
                    style="width: 100%; background: linear-gradient(135deg, var(--color-primary), #0051D5);">
                    <i class="fas fa-sign-in-alt" style="margin-right: var(--space-2);"></i>
                    로그인
                </button>

                <a href="/" class="text-body" style="display: block; text-align: center; color: var(--color-text-secondary); text-decoration: none; transition: color 0.2s;">
                    <i class="fas fa-arrow-left" style="margin-right: var(--space-2);"></i>
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

            errorMessage.style.display = 'none'
            loginButton.disabled = true
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: var(--space-2);"></i>로그인 중...'

            try {
                const response = await AuthAPI.adminLogin(username, password)
                
                saveToken(response.token)
                saveUser(response.user)
                
                window.location.href = '/dashboard/admin'
            } catch (error) {
                errorText.textContent = error.message
                errorMessage.style.display = 'flex'
                
                loginButton.disabled = false
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right: var(--space-2);"></i>로그인'
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
    <meta name="theme-color" content="#00A0B0">
    
    <link rel="stylesheet" href="/static/style.css">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body style="background: linear-gradient(135deg, #E0F7FA, var(--color-secondary-light)); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-4);">
    <div style="max-width: 28rem; width: 100%;">
        <div style="text-align: center; margin-bottom: var(--space-8);">
            <a href="/" style="display: inline-block; padding: var(--space-4); background: linear-gradient(135deg, var(--color-secondary), #0099CC); border-radius: 50%; margin-bottom: var(--space-4); text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 160, 176, 0.3);">
                <i class="fas fa-users" style="color: white; font-size: 2.5rem;"></i>
            </a>
            <h1 class="text-title1" style="color: var(--color-text-primary); margin-bottom: var(--space-2);">부스 운영자 로그인</h1>
            <p class="text-body" style="color: var(--color-text-secondary);">부스 코드를 입력하세요</p>
        </div>

        <div class="card" style="padding: var(--space-8);">
            <form id="loginForm" style="display: flex; flex-direction: column; gap: var(--space-6);">
                <div>
                    <label class="text-footnote" style="display: block; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">
                        <i class="fas fa-key" style="margin-right: var(--space-2);"></i>부스 코드 (6자리)
                    </label>
                    <input type="text" id="boothCode" required maxlength="6"
                        class="input"
                        placeholder="GEMI01"
                        style="width: 100%; text-align: center; font-size: 1.5rem; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; letter-spacing: 0.1em; text-transform: uppercase;">
                </div>

                <div class="info-box">
                    <i class="fas fa-info-circle" style="margin-right: var(--space-2); color: var(--color-primary);"></i>
                    부스 코드는 관리자로부터 전달받은 6자리 코드입니다.
                </div>
                
                <!-- 부스 코드 찾기 링크 추가 -->
                <div style="text-align: center;">
                    <button type="button" onclick="showBoothCodeFinder()" class="text-footnote" style="background: none; border: none; color: var(--color-secondary); cursor: pointer; font-weight: 600; transition: opacity 0.2s;">
                        <i class="fas fa-search" style="margin-right: var(--space-1);"></i>
                        부스 코드를 잊으셨나요?
                    </button>
                </div>

                <div id="errorMessage" class="status-alert status-alert-error" style="display: none;">
                    <i class="fas fa-exclamation-circle" style="margin-right: var(--space-2);"></i>
                    <span id="errorText"></span>
                </div>

                <button type="submit" id="loginButton"
                    class="btn btn-secondary btn-lg"
                    style="width: 100%; background: linear-gradient(135deg, var(--color-secondary), #0099CC);">
                    <i class="fas fa-sign-in-alt" style="margin-right: var(--space-2);"></i>
                    로그인
                </button>

                <a href="/" class="text-body" style="display: block; text-align: center; color: var(--color-text-secondary); text-decoration: none; transition: color 0.2s;">
                    <i class="fas fa-arrow-left" style="margin-right: var(--space-2);"></i>
                    메인으로 돌아가기
                </a>
            </form>
        </div>
    </div>
    
    <!-- 부스 코드 찾기 모달 -->
    <div id="boothCodeFinderModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); align-items: center; justify-content: center; padding: var(--space-4); z-index: 50;" onclick="hideBoothCodeFinder()">
        <div class="card" style="max-width: 28rem; width: 100%; padding: var(--space-6); animation: slideUp 0.3s ease-out;" onclick="event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                <h2 class="text-title2" style="color: var(--color-text-primary);">
                    <i class="fas fa-search" style="color: var(--color-secondary); margin-right: var(--space-2);"></i>
                    부스 코드 찾기
                </h2>
                <button onclick="hideBoothCodeFinder()" style="background: none; border: none; color: var(--color-text-tertiary); cursor: pointer; min-width: var(--touch-target-min); min-height: var(--touch-target-min); display: flex; align-items: center; justify-content: center; transition: color 0.2s;">
                    <i class="fas fa-times" style="font-size: 1.5rem;"></i>
                </button>
            </div>
            
            <p class="text-body" style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">
                관리자에게 전화하지 말고 직접 찾아보세요!
            </p>
            
            <form id="findBoothCodeForm" style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div>
                    <label class="text-footnote" style="display: block; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">
                        <i class="fas fa-calendar-alt" style="margin-right: var(--space-1);"></i>행사 선택
                    </label>
                    <select id="eventSelectForFinder" required
                        class="input"
                        style="width: 100%;">
                        <option value="">선택하세요</option>
                    </select>
                </div>
                
                <div>
                    <label class="text-footnote" style="display: block; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-2);">
                        <i class="fas fa-store" style="margin-right: var(--space-1);"></i>부스명
                    </label>
                    <input type="text" id="boothNameSearch" required
                        class="input"
                        placeholder="부스 이름을 입력하세요 (일부만 입력해도 됩니다)"
                        style="width: 100%;">
                </div>
                
                <div id="finderError" class="status-alert status-alert-error" style="display: none;">
                    <i class="fas fa-exclamation-circle" style="margin-right: var(--space-2);"></i>
                    <span id="finderErrorText"></span>
                </div>
                
                <button type="submit" id="searchButton"
                    class="btn btn-secondary btn-lg"
                    style="width: 100%; background: linear-gradient(135deg, var(--color-secondary), #0099CC);">
                    <i class="fas fa-search" style="margin-right: var(--space-2);"></i>
                    검색
                </button>
            </form>
            
            <!-- 검색 결과 -->
            <div id="boothCodeResult" style="display: none; margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
                <div class="status-alert status-alert-success" style="text-align: center; flex-direction: column;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: var(--space-2);"></i>
                    <p class="text-body" style="color: var(--color-text-primary); margin-bottom: var(--space-2);">찾은 부스 코드</p>
                    <div id="foundBoothCodes" style="display: flex; flex-direction: column; gap: var(--space-2); width: 100%;">
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
                errorMessage.style.display = 'flex'
                return
            }

            errorMessage.style.display = 'none'
            loginButton.disabled = true
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: var(--space-2);"></i>로그인 중...'

            try {
                const response = await AuthAPI.operatorLogin(boothCode)
                
                saveToken(response.token)
                saveUser(response.user)
                
                window.location.href = '/dashboard/operator'
            } catch (error) {
                errorText.textContent = error.message
                errorMessage.style.display = 'flex'
                
                loginButton.disabled = false
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right: var(--space-2);"></i>로그인'
            }
        })
        
        // === 부스 코드 찾기 기능 ===
        
        // 모달 표시
        function showBoothCodeFinder() {
            const modal = document.getElementById('boothCodeFinderModal')
            modal.style.display = 'flex'
            loadActiveEvents()
        }
        
        // 모달 숨기기
        function hideBoothCodeFinder() {
            document.getElementById('boothCodeFinderModal').style.display = 'none'
            document.getElementById('boothCodeResult').style.display = 'none'
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
                finderError.style.display = 'flex'
                return
            }
            
            finderError.style.display = 'none'
            resultDiv.style.display = 'none'
            searchButton.disabled = true
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: var(--space-2);"></i>검색 중...'
            
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
                        boothCard.className = 'card'
                        boothCard.style.padding = 'var(--space-3)'
                        boothCard.style.background = 'rgba(0, 160, 176, 0.05)'
                        boothCard.innerHTML = \`
                            <p class="text-caption1" style="color: var(--color-text-secondary); margin-bottom: var(--space-1);">\${booth.name}</p>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-size: 1.875rem; font-family: 'SF Mono', monospace; font-weight: 700; color: var(--color-secondary);">\${booth.booth_code}</span>
                                <button onclick="copyBoothCode('\${booth.booth_code}')" 
                                    class="btn btn-secondary"
                                    style="padding: var(--space-2) var(--space-3); font-size: 0.875rem;">
                                    <i class="fas fa-copy" style="margin-right: var(--space-1);"></i>복사
                                </button>
                            </div>
                        \`
                        foundCodesDiv.appendChild(boothCard)
                    })
                    
                    resultDiv.style.display = 'flex'
                } else {
                    finderErrorText.textContent = '해당하는 부스를 찾을 수 없습니다.'
                    finderError.style.display = 'flex'
                }
                
            } catch (error) {
                finderErrorText.textContent = error.message
                finderError.style.display = 'flex'
            } finally {
                searchButton.disabled = false
                searchButton.innerHTML = '<i class="fas fa-search" style="margin-right: var(--space-2);"></i>검색'
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
