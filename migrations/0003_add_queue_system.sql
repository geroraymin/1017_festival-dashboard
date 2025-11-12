-- 대기열 시스템 추가
-- 참가자가 방명록 작성 후 대기번호를 받고, 순서대로 호출됨

-- 대기열 테이블
CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booth_id INTEGER NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
    participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    queue_number INTEGER NOT NULL,
    status TEXT CHECK (status IN ('waiting', 'called', 'completed', 'cancelled')) DEFAULT 'waiting',
    called_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_queue_booth_status ON queue(booth_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_booth_number ON queue(booth_id, queue_number);
CREATE INDEX IF NOT EXISTS idx_queue_participant ON queue(participant_id);

-- 대기번호는 부스별로 순차 증가 (1, 2, 3, ...)
-- status 상태:
--   - waiting: 대기 중
--   - called: 호출됨 (곧 입장)
--   - completed: 체험 완료
--   - cancelled: 취소됨
