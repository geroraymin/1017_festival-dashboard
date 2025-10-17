-- 기존 제약 조건 삭제 및 새로운 제약 조건 추가

-- gender 제약 조건 업데이트 (기타 제거)
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_gender_check;
ALTER TABLE participants ADD CONSTRAINT participants_gender_check 
    CHECK (gender IN ('남성', '여성'));

-- grade 제약 조건 업데이트 (유아, 성인 추가)
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_grade_check;
ALTER TABLE participants ADD CONSTRAINT participants_grade_check 
    CHECK (grade IN ('유아', '초등', '중등', '고등', '성인', '기타'));
