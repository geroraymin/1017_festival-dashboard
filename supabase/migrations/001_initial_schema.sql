-- 제미나이 부스 디지털 방명록 시스템
-- Supabase 데이터베이스 초기 스키마

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 행사 테이블
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 부스 테이블
CREATE TABLE IF NOT EXISTS booths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    booth_code TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booth_id UUID REFERENCES booths(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('남성', '여성')),
    grade TEXT CHECK (grade IN ('유아', '초등', '중등', '고등', '성인', '기타')),
    date_of_birth DATE,
    has_consented BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_booths_event_id ON booths(event_id);
CREATE INDEX IF NOT EXISTS idx_booths_booth_code ON booths(booth_code);
CREATE INDEX IF NOT EXISTS idx_participants_booth_id ON participants(booth_id);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booths_updated_at BEFORE UPDATE ON booths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- RLS 정책: admins 테이블 (서버 측에서만 접근 가능하도록 service_role 키 사용)
CREATE POLICY "Service role can manage admins" ON admins
    FOR ALL USING (auth.role() = 'service_role');

-- RLS 정책: events 테이블 (읽기는 모두 가능, 쓰기는 서버 측에서만)
CREATE POLICY "Anyone can read events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage events" ON events
    FOR ALL USING (auth.role() = 'service_role');

-- RLS 정책: booths 테이블 (읽기는 모두 가능, 쓰기는 서버 측에서만)
CREATE POLICY "Anyone can read booths" ON booths
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage booths" ON booths
    FOR ALL USING (auth.role() = 'service_role');

-- RLS 정책: participants 테이블 (읽기/쓰기 모두 서버 측에서만)
CREATE POLICY "Service role can manage participants" ON participants
    FOR ALL USING (auth.role() = 'service_role');

-- 기본 관리자 계정 생성 (username: admin, password: admin1234)
-- 실제 운영 시 반드시 변경하세요!
-- 비밀번호 해시는 bcrypt로 생성된 값입니다
INSERT INTO admins (username, password_hash) VALUES 
    ('admin', '$2a$10$rF8KZXqQTMvJrKkw8kJQVOKJ7nZJ0YP.xLMvjHqGqx1QqKQqKqKQq')
ON CONFLICT (username) DO NOTHING;

-- 샘플 행사 데이터 (테스트용)
INSERT INTO events (name, start_date, end_date) VALUES 
    ('2025 제미나이 페스티벌', '2025-01-15', '2025-01-17')
ON CONFLICT DO NOTHING;
