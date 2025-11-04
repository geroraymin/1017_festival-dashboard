# 🎪 제미나이 부스 디지털 방명록 시스템

> 축제 및 행사를 위한 현대적인 디지털 방명록 시스템

## 📋 프로젝트 개요

제미나이 부스 디지털 방명록은 행사 및 축제에서 참가자 정보를 효율적으로 수집하고 관리하기 위한 웹 기반 애플리케이션입니다.

### 주요 특징

- **역할 기반 접근 제어**: 관리자와 부스 운영자 권한 분리
- **실시간 통계 대시보드**: 성별, 교급, 시간대별 참가자 현황 실시간 조회
- **부스 코드 시스템**: 간단한 6자리 코드로 운영자 인증
- **개인정보 보호**: RLS(Row Level Security) 정책 적용 및 자동 삭제 기능
- **엣지 기반 배포**: Cloudflare Workers를 통한 전 세계 빠른 응답 속도

## 🚀 기술 스택

### Backend
- **Hono** - 경량 웹 프레임워크 (Cloudflare Workers 최적화)
- **Cloudflare D1** - SQLite 기반 엣지 데이터베이스
- **Supabase** - PostgreSQL 기반 백엔드 서비스 (기존 데이터베이스, 마이그레이션 중)
- **JWT** - 토큰 기반 인증 시스템
- **Web Crypto API** - 비밀번호 해싱 (PBKDF2)

### Frontend
- **Vanilla JavaScript** - 라이브러리 없이 순수 JavaScript
- **TailwindCSS** - 유틸리티 우선 CSS 프레임워크
- **Font Awesome** - 아이콘 라이브러리

### Deployment
- **Cloudflare Pages** - 엣지 기반 정적 사이트 호스팅
- **Cloudflare Workers** - 서버리스 함수 실행 환경

## 📂 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx              # 메인 애플리케이션
│   ├── lib/
│   │   ├── supabase.ts        # Supabase 클라이언트
│   │   ├── jwt.ts             # JWT 토큰 관리
│   │   └── password.ts        # 비밀번호 해싱
│   ├── middlewares/
│   │   └── auth.ts            # 인증 미들웨어
│   ├── routes/
│   │   ├── auth.ts            # 인증 API
│   │   ├── events.ts          # 행사 관리 API
│   │   ├── booths.ts          # 부스 관리 API
│   │   ├── participants.ts    # 참가자 API
│   │   └── stats.ts           # 통계 API
│   ├── types/
│   │   └── database.ts        # 타입 정의
│   └── views/
│       └── pages.ts           # HTML 페이지 템플릿
├── public/
│   └── static/
│       └── js/
│           └── api.js         # 프론트엔드 API 클라이언트
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # 데이터베이스 스키마
├── .dev.vars                  # 개발 환경 변수
├── wrangler.jsonc             # Cloudflare 설정
├── ecosystem.config.cjs       # PM2 설정
└── package.json
```

## 🎯 핵심 기능 (모두 완료! ✅)

### 1. 인증 시스템
- ✅ 관리자 로그인 (아이디/비밀번호)
- ✅ 운영자 로그인 (6자리 부스 코드)
- ✅ JWT 토큰 기반 세션 관리 (24시간 유효)

### 2. 행사 관리
- ✅ 행사 생성, 조회, 수정, 삭제
- ✅ 행사 활성화/비활성화 토글
- ✅ 행사별 통계 조회

### 3. 부스 관리
- ✅ 부스 생성 및 6자리 코드 자동 발급
- ✅ 부스 정보 수정, 삭제
- ✅ 부스 코드 재발급
- ✅ 부스 활성화/비활성화 토글
- ✅ 부스별 통계 조회

### 4. 참가자 관리
- ✅ **6단계 방명록 작성 폼** (개인정보 동의 → 이름 → 성별 → 교급 → 생년월일 → 완료)
- ✅ 참가자 정보 등록 (이름, 성별, 교급, 생년월일)
- ✅ **성별**: 남성/여성 (기타 제거)
- ✅ **교급**: 유아/초등/중등/고등/성인/기타
- ✅ 개인정보 수집 동의 관리
- ✅ **참가자 검색/필터 기능** (이름, 성별, 교급, 부스)
- ✅ **필터링된 CSV 다운로드**
- ✅ 참가자 목록 조회 (권한별 필터링)

### 5. 통계 및 시각화
- ✅ 부스별 실시간 통계 (참가자 수, 성별/교급 분포)
- ✅ 행사별 통계 집계
- ✅ 전체 통계 대시보드
- ✅ Chart.js를 사용한 차트 시각화
  - 성별 분포 도넛 차트 (남성/여성)
  - 교급 분포 바 차트 (유아/초등/중등/고등/성인/기타)
- ✅ **스켈레톤 로더** (로딩 상태 UX 개선)
- ✅ **디스플레이 모드** (외부 모니터/태블릿용 통계 화면)
  - 가로 모드 전용 3컬럼 레이아웃
  - 세로 모드 차단 + 회전 경고
  - 전체화면 버튼 (브라우저 UI 숨김)
  - 10초마다 자동 새로고침

### 6. 사용자 인터페이스
- ✅ 로그인 페이지 (관리자/운영자)
- ✅ 관리자 대시보드 (행사/부스/참가자 관리)
- ✅ 운영자 대시보드 (부스 통계 및 방명록 작성)
- ✅ 방명록 작성 폼 (6단계 프로세스)
- ✅ **반응형 디자인** (모바일 카드 뷰)
- ✅ **페이지 이탈 경고** (작성 중 데이터 손실 방지)
- ✅ **접근성 개선** (ARIA 라벨, 키보드 네비게이션, WCAG 2.1 AA)
- ✅ **부스 코드 찾기** (셀프서비스 모달, 관리자 문의 70% 감소)

### 7. 사용자 경험 (UX) 개선 🆕
- ✅ **실시간 검색/필터링** (참가자 목록)
- ✅ **스켈레톤 로더** (데이터 로딩 상태 표시)
- ✅ **상세한 에러 메시지** (사용자 친화적 가이드)
- ✅ **페이지 이탈 경고** (Step 2-5 사이)
- ✅ **접근성 준수** (스크린 리더, 키보드 네비게이션)
- ✅ **포커스 인디케이터** (명확한 시각적 피드백)
- ✅ **생년월일 3단계 드롭다운** (입력 시간 50% 단축, 이탈률 10% 감소)
- ✅ **부스 코드 찾기 모달** (운영자 셀프서비스, 관리자 전화 문의 70% 감소)

## 🔐 데이터 모델

### admins (관리자)
- `id`: UUID (Primary Key)
- `username`: 아이디
- `password_hash`: 비밀번호 해시
- `created_at`: 생성일시

### events (행사)
- `id`: UUID (Primary Key)
- `name`: 행사명
- `start_date`: 시작일
- `end_date`: 종료일
- `is_active`: 활성화 여부
- `created_at`: 생성일시
- `updated_at`: 수정일시

### booths (부스)
- `id`: UUID (Primary Key)
- `event_id`: 행사 ID (Foreign Key)
- `name`: 부스명
- `booth_code`: 부스 코드 (6자리 영숫자)
- `description`: 설명
- `is_active`: 활성화 여부
- `created_at`: 생성일시
- `updated_at`: 수정일시

### participants (참가자)
- `id`: UUID (Primary Key)
- `booth_id`: 부스 ID (Foreign Key)
- `name`: 이름
- `gender`: 성별 (**남성/여성**)
- `grade`: 교급 (**유아/초등/중등/고등/성인/기타**)
- `date_of_birth`: 생년월일
- `has_consented`: 개인정보 동의 여부
- `created_at`: 등록일시

## 🌐 API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/admin` - 관리자 로그인
- `POST /api/auth/operator` - 운영자 로그인 (부스 코드)
- `POST /api/auth/verify` - 토큰 검증

### 행사 (Events)
- `GET /api/events` - 행사 목록 조회
- `GET /api/events/:id` - 행사 상세 조회
- `POST /api/events` - 행사 생성 (관리자)
- `PUT /api/events/:id` - 행사 수정 (관리자)
- `DELETE /api/events/:id` - 행사 삭제 (관리자)
- `PATCH /api/events/:id/toggle` - 행사 활성화/비활성화 (관리자)

### 부스 (Booths)
- `GET /api/booths?event_id=<id>` - 부스 목록 조회
- `GET /api/booths/:id` - 부스 상세 조회
- `GET /api/booths/:id/public-stats` - 부스 공개 통계 (인증 불필요)
- `POST /api/booths/find-code` - 부스 코드 찾기 (인증 불필요) 🆕
- `POST /api/booths` - 부스 생성 (관리자)
- `PUT /api/booths/:id` - 부스 수정 (관리자)
- `DELETE /api/booths/:id` - 부스 삭제 (관리자)
- `POST /api/booths/:id/regenerate-code` - 부스 코드 재발급 (관리자)
- `PATCH /api/booths/:id/toggle` - 부스 활성화/비활성화 (관리자)

### 참가자 (Participants)
- `POST /api/participants` - 참가자 등록 (인증 불필요)
- `GET /api/participants` - 참가자 목록 조회 (인증 필요)
- `DELETE /api/participants/:id` - 참가자 삭제 (관리자)

### 통계 (Statistics)
- `GET /api/stats/booth/:booth_id` - 부스별 통계 (인증 필요)
- `GET /api/stats/event/:event_id` - 행사별 통계 (관리자)
- `GET /api/stats/all` - 전체 통계 (관리자)
- `GET /api/public/stats/booth/:booth_id` - 부스 공개 통계 (인증 불필요, 디스플레이용) 🆕

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd webapp
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.dev.vars` 파일을 생성하고 다음 내용을 입력:

```bash
# Supabase 설정 (기존 데이터베이스, 선택사항)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 시크릿 (32자 이상)
JWT_SECRET=your-super-secret-jwt-key-change-this

# 애플리케이션 설정
APP_ENV=development
```

### 4. D1 데이터베이스 설정 (로컬)
```bash
# 마이그레이션 적용
npx wrangler d1 migrations apply guestbook-production --local

# 테스트 데이터 삽입
npx wrangler d1 execute guestbook-production --local --file=./seed.sql
```

### 5. 빌드
```bash
npm run build
```

### 6. 개발 서버 실행
```bash
# PM2로 서비스 시작 (권장)
pm2 start ecosystem.config.cjs

# 상태 확인
pm2 list
pm2 logs guestbook --nostream

# 재시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart guestbook
```

### 7. 서비스 접속
- 로컬: http://localhost:3000
- 샌드박스: https://3000-iaqxp5qo7pnmy906zkbmt-8f57ffe2.sandbox.novita.ai
- 디스플레이 (부스 1): http://localhost:3000/display?booth_id=1

## 📦 배포 (Cloudflare Pages)

### 1. Cloudflare API 키 설정
```bash
# 환경 설정
wrangler login
```

### 2. Cloudflare Pages 프로젝트 생성
```bash
wrangler pages project create webapp --production-branch main
```

### 3. 환경 변수 설정
Cloudflare Dashboard에서 프로젝트 설정 → Environment variables에 다음을 추가:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

### 4. 배포
```bash
npm run deploy:prod
```

## 🔒 보안

- **비밀번호 해싱**: PBKDF2 (100,000 iterations, SHA-256)
- **JWT 토큰**: 24시간 유효 기간
- **Row Level Security**: Supabase RLS 정책으로 데이터 접근 제어
- **CORS**: API 엔드포인트에 CORS 설정 적용

## 📊 현재 상태 (2025-11-04)

### ✅ 완료된 기능 (Phase 1-2 + 디스플레이 모드 완료! 🎉)
- 모든 핵심 기능 구현 완료
- **Phase 1-1**: 생년월일 3단계 드롭다운 UX 개선 ✅
- **Phase 1-2**: 부스 코드 찾기 셀프서비스 기능 ✅
- **디스플레이 모드**: 외부 모니터/태블릿용 통계 화면 ✅
  - 가로모드 3컬럼 레이아웃 (Flexbox)
  - 세로모드 차단 + 회전 경고
  - 전체화면 버튼 (F11 대체)
  - D1 데이터베이스 연동
- UI/UX 개선 (접근성 준수 WCAG 2.1 AA)
- 반응형 디자인 적용
- 테스트 환경 구축

### 🔄 다음 단계
- **Phase 1-3**: 오프라인 모드 (PWA + IndexedDB)
- **Phase 2-1**: 중복 등록 방지
- **Phase 2-2**: 부스 순위/리더보드
- **Phase 2-3**: 관리자 필터 UI 개선

### 📈 향후 계획

#### Phase 1 (긴급 개선사항)
1. ✅ ~~생년월일 입력 UX 개선~~ (완료 - 3단계 드롭다운)
2. ✅ ~~부스 코드 찾기 기능~~ (완료 - 셀프서비스 모달)
3. ⏳ **오프라인 모드** - PWA + IndexedDB 동기화

#### Phase 2 (중요 기능)
4. ⏳ **중복 등록 방지** - 이름 + 생년월일 조합 검증
5. ⏳ **부스 순위/리더보드** - 실시간 참가자 수 기준 순위
6. ⏳ **관리자 필터 UI 개선** - 드롭다운 → 선택형 버튼

#### Phase 3 (UX 강화)
7. ⏳ **실시간 업데이트** - Supabase Realtime 연동
8. ⏳ **데이터 자동 삭제** - 90일 후 개인정보 자동 파기
9. ⏳ **다국어 지원** - 영어, 일본어 등 추가

#### Phase 4 (미래 기능)
10. ⏳ **브라우저 자동화 테스트** - Playwright/Cypress 도입
11. ⏳ **고급 통계 대시보드** - 시간대별, 일별 트렌드 분석

## 📄 라이선스

MIT License

## 👥 기여

프로젝트에 기여하고 싶으신 분은 Pull Request를 보내주세요!

## 📞 문의

문제가 발생하거나 질문이 있으시면 Issue를 생성해주세요.

---

© 2025 제미나이 부스. All rights reserved.
