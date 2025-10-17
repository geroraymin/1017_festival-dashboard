# 🚀 제미나이 부스 디지털 방명록 - 설정 가이드

## 📋 목차

1. [Supabase 프로젝트 설정](#1-supabase-프로젝트-설정)
2. [데이터베이스 초기화](#2-데이터베이스-초기화)
3. [관리자 계정 생성](#3-관리자-계정-생성)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [로컬 개발 환경 실행](#5-로컬-개발-환경-실행)
6. [Cloudflare Pages 배포](#6-cloudflare-pages-배포)

---

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 회원가입 및 프로젝트 생성

1. [Supabase 웹사이트](https://supabase.com)에 접속
2. "Start your project" 클릭하여 회원가입
3. 새 프로젝트 생성:
   - Organization: 새로 생성하거나 기존 조직 선택
   - Project name: `gemini-booth-guestbook` (원하는 이름)
   - Database Password: 강력한 비밀번호 설정 (잘 보관하세요!)
   - Region: `Northeast Asia (Seoul)` 권장
   - Pricing Plan: `Free` (개발용) 또는 `Pro` (프로덕션용)

### 1.2 API 키 확인

프로젝트 생성 후 Settings → API로 이동:

- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: 공개 키 (읽기 전용)
- **service_role key**: 서비스 키 (⚠️ 절대 클라이언트에 노출하지 마세요!)

이 두 키를 복사하여 안전한 곳에 보관합니다.

---

## 2. 데이터베이스 초기화

### 2.1 SQL Editor 접속

Supabase Dashboard → SQL Editor로 이동

### 2.2 마이그레이션 실행

`supabase/migrations/001_initial_schema.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행합니다.

```sql
-- 복사한 SQL 내용 실행
-- 실행 버튼 클릭 (또는 Ctrl/Cmd + Enter)
```

### 2.3 테이블 확인

Table Editor로 이동하여 다음 테이블이 생성되었는지 확인:

- ✅ `admins` - 관리자
- ✅ `events` - 행사
- ✅ `booths` - 부스
- ✅ `participants` - 참가자

---

## 3. 관리자 계정 생성

### 3.1 비밀번호 해시 생성

**중요**: 기본 SQL에 포함된 샘플 관리자 계정은 보안상 안전하지 않습니다!

프로덕션 환경에서는 반드시 새로운 관리자 계정을 생성해야 합니다.

#### 방법 1: 웹 기반 PBKDF2 생성기 사용

1. 온라인 PBKDF2 생성기 접속 (예: https://8gwifi.org/pbkdf.jsp)
2. 설정:
   - Password: 원하는 비밀번호 입력
   - Salt: 랜덤 16바이트 생성 (Base64)
   - Iterations: 100000
   - Hash: SHA-256
   - Key Length: 256 bits
3. 생성된 해시를 `pbkdf2:salt:hash` 형식으로 저장

#### 방법 2: Node.js 스크립트 사용

프로젝트 루트에서 다음 스크립트 실행:

```javascript
// hash-password.js
const crypto = require('crypto')

function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
  
  const saltBase64 = salt.toString('base64')
  const hashBase64 = hash.toString('base64')
  
  return `pbkdf2:${saltBase64}:${hashBase64}`
}

const password = process.argv[2] || 'your-password-here'
console.log(hashPassword(password))
```

실행:
```bash
node hash-password.js "your-secure-password"
```

### 3.2 SQL로 관리자 추가

Supabase SQL Editor에서 실행:

```sql
-- 기존 샘플 계정 삭제
DELETE FROM admins WHERE username = 'admin';

-- 새 관리자 계정 추가
INSERT INTO admins (username, password_hash) 
VALUES ('your-username', 'pbkdf2:생성한-salt:생성한-hash');
```

---

## 4. 환경 변수 설정

### 4.1 로컬 개발 환경 (`.dev.vars`)

프로젝트 루트에 `.dev.vars` 파일 생성:

```bash
# Supabase 설정
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# JWT 시크릿 (32자 이상의 강력한 랜덤 문자열)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# 애플리케이션 설정
APP_ENV=development
```

**⚠️ 주의**: `.dev.vars` 파일은 `.gitignore`에 포함되어 있으므로 Git에 커밋되지 않습니다.

### 4.2 프로덕션 환경 (Cloudflare Pages)

Cloudflare Dashboard에서 환경 변수 설정:

1. Cloudflare Dashboard → Pages → 프로젝트 선택
2. Settings → Environment variables
3. 다음 변수 추가:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `APP_ENV=production`

---

## 5. 로컬 개발 환경 실행

### 5.1 의존성 설치
```bash
npm install
```

### 5.2 프로젝트 빌드
```bash
npm run build
```

### 5.3 개발 서버 실행

**방법 1: Wrangler 직접 실행**
```bash
npm run dev:sandbox
```

**방법 2: PM2 사용 (권장)**
```bash
# PM2 설치 (전역)
npm install -g pm2

# 서버 시작
pm2 start ecosystem.config.cjs

# 로그 확인
pm2 logs guestbook

# 서버 중지
pm2 stop guestbook

# 서버 재시작
pm2 restart guestbook
```

### 5.4 접속 확인

브라우저에서 http://localhost:3000 접속

- ✅ 메인 페이지 로드 확인
- ✅ 관리자 로그인 페이지 접속 (/admin)
- ✅ 운영자 로그인 페이지 접속 (/operator)
- ✅ API 헬스 체크 (http://localhost:3000/api/health)

---

## 6. Cloudflare Pages 배포

### 6.1 Cloudflare 계정 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속 및 로그인
2. Pages → Create a project

### 6.2 Wrangler CLI 설치 및 로그인

```bash
# Wrangler 설치 (이미 설치됨)
npm install -g wrangler

# Cloudflare 계정 연동
wrangler login
```

### 6.3 Pages 프로젝트 생성

```bash
# 프로젝트 생성
wrangler pages project create webapp --production-branch main

# 또는 다른 이름 사용
wrangler pages project create gemini-booth-guestbook --production-branch main
```

### 6.4 환경 변수 설정

Cloudflare Dashboard에서:
1. Pages → 프로젝트 선택
2. Settings → Environment variables
3. 모든 환경 변수 추가 (위 4.2 참조)

또는 CLI 사용:
```bash
# 시크릿 추가
wrangler pages secret put SUPABASE_URL --project-name webapp
wrangler pages secret put SUPABASE_ANON_KEY --project-name webapp
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name webapp
wrangler pages secret put JWT_SECRET --project-name webapp
```

### 6.5 배포 실행

```bash
# 빌드 및 배포
npm run deploy:prod

# 또는 수동으로
npm run build
wrangler pages deploy dist --project-name webapp
```

### 6.6 배포 확인

배포 완료 후 생성된 URL 접속:
- 프로덕션: `https://webapp.pages.dev`
- 프리뷰: `https://main.webapp.pages.dev`

---

## 🔧 문제 해결 (Troubleshooting)

### 문제 1: "Invalid JWT token" 오류

**원인**: JWT_SECRET이 설정되지 않았거나 클라이언트와 서버의 시크릿이 다릅니다.

**해결**:
1. `.dev.vars` 파일에 `JWT_SECRET` 확인
2. 최소 32자 이상의 강력한 랜덤 문자열 사용
3. 서버 재시작

### 문제 2: "Supabase connection failed"

**원인**: Supabase URL 또는 API 키가 올바르지 않습니다.

**해결**:
1. Supabase Dashboard → Settings → API에서 키 재확인
2. `.dev.vars` 파일의 URL과 키 업데이트
3. URL 끝에 슬래시(/) 없는지 확인

### 문제 3: "Table does not exist"

**원인**: 데이터베이스 마이그레이션이 실행되지 않았습니다.

**해결**:
1. Supabase SQL Editor 접속
2. `supabase/migrations/001_initial_schema.sql` 다시 실행
3. Table Editor에서 테이블 생성 확인

### 문제 4: 로그인 후 "Unauthorized" 오류

**원인**: 비밀번호 해시가 올바르지 않거나 RLS 정책 문제

**해결**:
1. 관리자 비밀번호 해시 재생성
2. SQL로 관리자 계정 재등록
3. Supabase Dashboard → Authentication → Policies에서 RLS 정책 확인

---

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Hono 프레임워크 문서](https://hono.dev/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)

---

## ✅ 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 관리자 계정 생성 (강력한 비밀번호)
- [ ] `.dev.vars` 파일 설정
- [ ] 로컬 개발 서버 실행 확인
- [ ] Cloudflare Pages 프로젝트 생성
- [ ] Cloudflare 환경 변수 설정
- [ ] 프로덕션 배포 및 테스트

모든 항목이 체크되면 시스템이 정상적으로 작동합니다! 🎉

---

© 2025 제미나이 부스. All rights reserved.
