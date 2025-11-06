-- 중복 방문 추적 기능 추가
-- 실인원(고유 참가자) vs 연인원(총 방문) 집계를 위한 마이그레이션

-- participants 테이블에 is_duplicate 컬럼 추가
ALTER TABLE participants ADD COLUMN is_duplicate INTEGER DEFAULT 0;

-- 중복 체크를 위한 인덱스 생성 (이름 + 생년월일 조합)
CREATE INDEX IF NOT EXISTS idx_participants_unique_person 
ON participants(name, date_of_birth);

-- 기존 데이터에 대한 중복 플래그 업데이트
-- 같은 이름+생년월일 조합이 여러 번 등장하면 첫 번째를 제외하고 is_duplicate = 1로 설정
UPDATE participants
SET is_duplicate = 1
WHERE id NOT IN (
    SELECT MIN(id)
    FROM participants
    GROUP BY name, date_of_birth
);
