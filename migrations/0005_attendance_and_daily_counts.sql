-- 참가자 실제 참석 확인용 컬럼
-- 통계 카운트는 기존 방명록 작성 건수 기준을 유지하고, 이 값은 현장 확인 체크 용도로만 사용합니다.

ALTER TABLE participants ADD COLUMN attended INTEGER NOT NULL DEFAULT 0;
ALTER TABLE participants ADD COLUMN attended_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_participants_attended ON participants(attended);
