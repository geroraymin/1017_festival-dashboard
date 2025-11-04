-- 제미나이 부스 디지털 방명록 시스템
-- Cloudflare D1 데이터베이스 스키마 (SQLite)

-- 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 행사 테이블
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 부스 테이블
CREATE TABLE IF NOT EXISTS booths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    booth_code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booth_id INTEGER REFERENCES booths(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('남성', '여성')),
    grade TEXT CHECK (grade IN ('유아', '초등', '중등', '고등', '성인', '기타')),
    date_of_birth DATE,
    has_consented BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_booths_event_id ON booths(event_id);
CREATE INDEX IF NOT EXISTS idx_booths_booth_code ON booths(booth_code);
CREATE INDEX IF NOT EXISTS idx_participants_booth_id ON participants(booth_id);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- 기본 관리자 계정 생성 (username: admin, password: admin1234)
INSERT INTO admins (username, password_hash) VALUES 
    ('admin', 'pbkdf2:uPe5QgXRQNPPHllF2phDqg==:OGmU6qdLfZHKL4U+kyXJBI3XwXB7MKrsT/awJuxKwR0=');

-- 샘플 행사 데이터
INSERT INTO events (name, start_date, end_date) VALUES 
    ('2025 제미나이 페스티벌', '2025-01-15', '2025-01-17');

-- 샘플 부스 데이터 (부스 코드는 6자리 영숫자)
INSERT INTO booths (event_id, name, booth_code, description) VALUES 
    (1, '제미나이 AI 체험 부스', 'GEMI01', 'AI 기술 체험 및 질의응답'),
    (1, 'VR 체험 부스', 'VR2023', '가상현실 체험존'),
    (1, '로봇 코딩 부스', 'ROBOT3', '로봇 프로그래밍 체험');
