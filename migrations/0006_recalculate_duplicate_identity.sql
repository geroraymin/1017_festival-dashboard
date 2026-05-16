-- 재방문 판정 기준을 이름+성별+교급+생년월일 전체 일치로 정정합니다.
-- 각 동일 인적사항 그룹에서 최초 등록 건만 첫방문으로 유지하고, 이후 등록 건만 재방문 처리합니다.

UPDATE participants SET is_duplicate = 0;

UPDATE participants
SET is_duplicate = 1
WHERE id IN (
    SELECT p.id
    FROM participants p
    WHERE EXISTS (
        SELECT 1
        FROM participants earlier
        WHERE earlier.name = p.name
          AND earlier.gender = p.gender
          AND earlier.grade = p.grade
          AND earlier.date_of_birth = p.date_of_birth
          AND (
            datetime(earlier.created_at) < datetime(p.created_at)
            OR (
              datetime(earlier.created_at) = datetime(p.created_at)
              AND earlier.id < p.id
            )
          )
    )
);
