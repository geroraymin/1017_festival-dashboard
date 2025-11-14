# 🎪 제미나이 부스 디지털 방명록 시스템

> 축제 및 행사를 위한 현대적인 디지털 방명록 시스템

## 📋 프로젝트 개요

제미나이 부스 디지털 방명록은 행사 및 축제에서 참가자 정보를 효율적으로 수집하고 관리하기 위한 웹 기반 애플리케이션입니다.

### 주요 특징

- **역할 기반 접근 제어**: 관리자와 부스 운영자 권한 분리
- **실시간 통계 대시보드**: 성별, 교급, 시간대별 참가자 현황 실시간 조회
- **부스 코드 시스템**: 간단한 6자리 코드로 운영자 인증
- **중복 방문 추적**: 실인원/연인원 분리 집계
- **데이터 백업**: 원클릭 전체 데이터 백업 (JSON)
- **엣지 기반 배포**: Cloudflare Workers를 통한 전 세계 빠른 응답 속도

## 🚀 기술 스택

### Backend
- **Hono** - 경량 웹 프레임워크 (Cloudflare Workers 최적화)
- **Cloudflare D1** - SQLite 기반 엣지 데이터베이스
- **JWT** - 토큰 기반 인증 시스템
- **Web Crypto API** - 비밀번호 해싱 (PBKDF2)
- **SendGrid API** - 이메일 전송 서비스 (CSV 전송용)

### Frontend
- **Vanilla JavaScript** - 라이브러리 없이 순수 JavaScript
- **TailwindCSS** - 유틸리티 우선 CSS 프레임워크
- **Font Awesome** - 아이콘 라이브러리
- **Chart.js** - 차트 시각화

### Deployment
- **Cloudflare Pages** - 엣지 기반 정적 사이트 호스팅
- **Cloudflare Workers** - 서버리스 함수 실행 환경

## 📂 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx              # 메인 애플리케이션
│   ├── lib/
│   │   ├── d1.ts              # D1 데이터베이스 타입
│   │   ├── jwt.ts             # JWT 토큰 관리
│   │   └── password.ts        # 비밀번호 해싱
│   ├── middlewares/
│   │   └── auth.ts            # 인증 미들웨어
│   ├── routes/
│   │   ├── auth.ts            # 인증 API
│   │   ├── events.ts          # 행사 관리 API
│   │   ├── booths.ts          # 부스 관리 API
│   │   ├── participants.ts    # 참가자 API
│   │   ├── stats.ts           # 통계 API
│   │   ├── email.ts           # 이메일 전송 API
│   │   └── backup.ts          # 데이터 백업 API
│   └── views/
│       └── pages.ts           # HTML 페이지 템플릿
├── public/
│   └── static/
│       └── js/
│           ├── api.js         # 프론트엔드 API 클라이언트
│           ├── admin-dashboard.js
│           └── operator-dashboard.js
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_add_duplicate_tracking.sql
├── .dev.vars                  # 개발 환경 변수
├── wrangler.jsonc             # Cloudflare 설정
└── package.json
```

## 배포 상태

- **플랫폼**: Cloudflare Pages
- **상태**: ✅ 활성
- **프로덕션 URL**: https://d59fe89d.guestbook-system.pages.dev
- **GitHub**: https://github.com/geroraymin/1017_festival-dashboard
- **기술 스택**: Hono + TypeScript + TailwindCSS + Cloudflare D1 + SendGrid
- **최종 업데이트**: 2025-01-15 08:21 KST

## 현재 완료된 기능

### 1. ✅ 관리자 대시보드
   - 전체 통계 조회 (행사별/부스별)
   - 행사, 부스, 참가자 관리
   - CSV 내보내기 (전체 데이터)
   - **데이터 백업 시스템 (JSON 형식)** 🆕
   - 차트 및 카드 모드 (실시간 통계 모니터링)
   - 실인원/연인원 집계 시스템

### 2. ✅ 부스 운영자 대시보드
   - 부스 코드 로그인
   - 실시간 방문자 통계
   - CSV 내보내기 (본인 부스만)
   - 이메일 전송 기능 (SendGrid)
   - 교급별 분포 차트 (5개 교급)

### 3. ✅ 방명록 작성 페이지
   - 6단계 참가자 정보 입력
   - 중복 방문 감지 (동일인 다른 부스 방문 허용)
   - 개인정보 동의
   - 생년월일 3단계 드롭다운 (년/월/일)
   - **자동 대기열 등록** 🆕
   - **대기열 티켓 페이지 리다이렉트** 🆕

### 4. ✅ 중복 방문 추적 시스템
   - name + date_of_birth 조합으로 실인원 식별
   - **모든 방문 허용 (동일 부스 재방문 포함)** 🆕
   - **연인원에 모든 방문 포함** 🆕
   - 재방문 시 환영 메시지 표시 (동일 부스 / 다른 부스 구분)
   - 실인원/연인원 분리 집계
   - CSV 내보내기 시 방문형태(첫방문/재방문) 표시

### 5. ✅ 데이터 백업 시스템 🆕
   - **원클릭 전체 데이터 백업** (JSON)
   - 행사, 부스, 참가자, 관리자 정보 포함
   - 통계 정보 자동 계산 (실인원/연인원)
   - 타임스탬프 파일명 자동 생성
   - 상세한 에러 로깅 및 처리
   - 백업 파일 다운로드

### 6. ✅ 이메일 기능 (SendGrid)
   - 부스별 CSV 파일 이메일 전송
   - 무료 플랜: 일 100통, 월 3,000통
   - 타블렛 환경 지원

### 7. ✅ 통계 및 시각화
   - 부스별 실시간 통계 (참가자 수, 성별/교급 분포)
   - 행사별 통계 집계
   - 전체 통계 대시보드
   - Chart.js 차트 시각화
   - 디스플레이 모드 (외부 모니터/태블릿)

### 8. ✅ 대기열 관리 시스템 (Phase 1 - 푸시 알림 없음) 🆕
   - **자동 대기열 등록**: 방명록 제출 시 자동으로 대기열에 추가
   - **대기열 번호 발급**: 부스별 순차적 번호 자동 생성
   - **티켓 페이지**: 대기 번호, 현재 진행 번호, 남은 인원 표시
   - **자동 새로고침**: 30초마다 자동으로 상태 업데이트
   - **운영자 관리**: 다음 손님 호출, 대기열 현황 확인
   - **TV 디스플레이**: 부스 입구 모니터용 대기 현황 화면

## 🔐 데이터 모델 (Cloudflare D1 - SQLite)

### admins (관리자)
- `id`: INTEGER (Primary Key, AUTOINCREMENT)
- `username`: 아이디
- `password_hash`: 비밀번호 해시 (PBKDF2)
- `created_at`: 생성일시

### events (행사)
- `id`: INTEGER (Primary Key, AUTOINCREMENT)
- `name`: 행사명
- `start_date`: 시작일
- `end_date`: 종료일
- `is_active`: 활성화 여부
- `created_at`, `updated_at`: 생성/수정일시

### booths (부스)
- `id`: INTEGER (Primary Key, AUTOINCREMENT)
- `event_id`: 행사 ID (Foreign Key)
- `name`: 부스명
- `booth_code`: 부스 코드 (6자리, UNIQUE)
- `description`: 설명
- `is_active`: 활성화 여부
- `created_at`, `updated_at`: 생성/수정일시

### participants (참가자)
- `id`: INTEGER (Primary Key, AUTOINCREMENT)
- `booth_id`: 부스 ID (Foreign Key)
- `name`: 이름
- `gender`: 성별 (남성/여성)
- `grade`: 교급 (유아/초등/중등/고등/성인)
- `date_of_birth`: 생년월일
- `has_consented`: 개인정보 동의 여부
- `is_duplicate`: 중복 방문 여부 (0=첫방문, 1=재방문)
- `created_at`: 등록일시

## 🌐 주요 API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/admin` - 관리자 로그인
- `POST /api/auth/operator` - 운영자 로그인 (부스 코드)

### 참가자 (Participants)
- `POST /api/participants` - 참가자 등록 (인증 불필요)
- `GET /api/participants` - 참가자 목록 조회 (인증 필요)

### 통계 (Statistics)
- `GET /api/stats/booth/:booth_id` - 부스별 통계
- `GET /api/stats/event/:event_id` - 행사별 통계
- `GET /api/stats/all` - 전체 통계

### 이메일 (Email)
- `POST /api/email/send-csv` - CSV 파일 이메일 전송

### 백업 (Backup) 🆕
- `GET /api/backup/export` - 전체 데이터 백업 (JSON)
- `POST /api/backup/import` - 백업 데이터 복원

### 대기열 (Queue) 🆕
- `POST /api/queue/join` - 대기열 참가
- `GET /api/queue/status/:booth_id` - 부스 대기열 현황 조회
- `GET /api/queue/my-status/:queue_id` - 내 대기 상태 조회
- `POST /api/queue/call-next` - 다음 손님 호출 (운영자 전용)
- `GET /api/queue/list/:booth_id` - 대기열 목록 조회 (운영자 전용)

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/geroraymin/1017_festival-dashboard.git
cd webapp
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.dev.vars` 파일 생성:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 4. D1 데이터베이스 설정 (로컬)
```bash
# 마이그레이션 적용
npx wrangler d1 migrations apply guestbook-production --local
```

### 5. 빌드 및 실행
```bash
# 빌드
npm run build

# PM2로 서비스 시작
pm2 start ecosystem.config.cjs

# 로그 확인
pm2 logs webapp --nostream
```

### 6. 서비스 접속
- **로컬**: http://localhost:3000
- **프로덕션**: https://ae0a53bc.guestbook-system.pages.dev

## 📦 배포 (Cloudflare Pages)

### 1. D1 프로덕션 데이터베이스 생성
```bash
npx wrangler d1 create guestbook-production
npx wrangler d1 migrations apply guestbook-production --remote
```

### 2. 환경 변수 설정 (Cloudflare Dashboard)
- `JWT_SECRET`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

### 3. 배포
```bash
npm run build
npx wrangler pages deploy dist --project-name guestbook-system
```

## 🔒 보안

- **비밀번호 해싱**: PBKDF2 (100,000 iterations, SHA-256)
- **JWT 토큰**: 24시간 유효 기간
- **역할 기반 접근 제어**: 관리자/운영자 권한 분리
- **CORS**: API 엔드포인트에 CORS 설정 적용
- **SQL Injection 방지**: 파라미터화된 쿼리 사용

## 📊 사용 가이드

### 관리자
1. `/admin`에서 로그인
2. 행사 및 부스 생성
3. 대시보드에서 실시간 통계 확인
4. CSV 다운로드 또는 데이터 백업

### 부스 운영자
1. `/operator`에서 부스 코드로 로그인
2. 방명록 작성 페이지로 이동
3. 참가자 정보 입력
4. 통계 확인 및 CSV/이메일 전송

### 참가자
1. 태블릿에서 방명록 작성 페이지 접속
2. 6단계 정보 입력
3. 개인정보 동의 후 제출

## 🎯 대기열 시스템 로드맵

### Phase 1: 기본 대기열 시스템 ✅ 완료
- ✅ 자동 대기열 등록
- ✅ 티켓 페이지 (대기 번호 표시)
- ✅ 운영자 관리 기능
- ✅ TV 디스플레이 화면
- ✅ 자동 새로고침 (30초)

### Phase 2: PWA + Web Push (다음 단계 - 무료)
- ⏳ PWA 변환 (설치 가능한 앱)
- ⏳ Web Push 알림 (순서 임박 알림)
- ⏳ 오프라인 모드 지원
- ⏳ 홈 화면 추가 기능

### Phase 3: 전문 푸시 서비스 (선택사항 - 유료)
- ⏳ OneSignal 통합 (가장 쉬움, 월 $9~)
- ⏳ Firebase FCM 통합 (가장 안정적, 무료 시작)
- ⏳ Novu 통합 (오픈소스, 자체 호스팅)

## 추천 다음 단계

1. **PWA 변환 및 Web Push 알림 (Phase 2)** ⭐ 권장
   - 무료로 푸시 알림 기능 추가
   - 앱처럼 사용 가능
   - 2-3시간 소요 예상

2. **백업 복원 기능 (선택사항)**
   - 백업 파일 업로드 UI
   - 데이터 복원 기능
   - 복원 전 데이터 검증

3. **데이터 분석 기능 강화**
   - 시간대별 방문자 추이 분석
   - 교급-성별 교차 분석
   - 부스별 인기도 분석

4. **알림 시스템**
   - 목표 달성 알림 (100명, 200명 등)
   - 이상 패턴 감지

## 📄 라이선스

MIT License

## 👥 기여

프로젝트에 기여하고 싶으신 분은 Pull Request를 보내주세요!

## 📞 문의

문제가 발생하거나 질문이 있으시면 Issue를 생성해주세요.

---

© 2025 제미나이 부스. All rights reserved.
