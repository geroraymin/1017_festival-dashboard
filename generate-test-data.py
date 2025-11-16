#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
교육용 테스트 데이터 생성기
- 10개 부스
- 각 부스당 100~200명 랜덤 배정
- 중복 방문 포함 (일부 참가자는 여러 부스 방문)
"""

import random
from datetime import datetime, timedelta

# 한국 이름 풀 (성씨 + 이름)
LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍']
FIRST_NAMES_MALE = ['민준', '서준', '도윤', '예준', '시우', '주원', '하준', '지호', '준서', '건우', '현우', '우진', '선우', '연우', '유준', '정우', '승우', '민재', '현준', '지훈']
FIRST_NAMES_FEMALE = ['서연', '서윤', '지우', '서현', '민서', '하은', '지아', '수빈', '지유', '채원', '지민', '다은', '예은', '은서', '가은', '서영', '예린', '수아', '유나', '채은']

GENDERS = ['남성', '여성']
GRADES = ['유아', '초등', '중등', '고등', '성인']

# 부스 정보
BOOTHS = [
    {'name': 'AI 체험 부스', 'code': 'TEST01', 'target': 150},
    {'name': 'VR/AR 체험관', 'code': 'TEST02', 'target': 180},
    {'name': '로봇 코딩 교실', 'code': 'TEST03', 'target': 165},
    {'name': '드론 비행 체험', 'code': 'TEST04', 'target': 145},
    {'name': '3D 프린팅 스튜디오', 'code': 'TEST05', 'target': 170},
    {'name': '메타버스 월드', 'code': 'TEST06', 'target': 155},
    {'name': '게임 개발 워크샵', 'code': 'TEST07', 'target': 190},
    {'name': '사이버 보안 체험', 'code': 'TEST08', 'target': 135},
    {'name': '스마트팜 IoT', 'code': 'TEST09', 'target': 160},
    {'name': '블록체인 NFT 전시', 'code': 'TEST10', 'target': 140}
]

def generate_name(gender):
    """한국 이름 생성"""
    last = random.choice(LAST_NAMES)
    if gender == '남성':
        first = random.choice(FIRST_NAMES_MALE)
    else:
        first = random.choice(FIRST_NAMES_FEMALE)
    return f'{last}{first}'

def generate_birth_date(grade):
    """교급에 맞는 생년월일 생성"""
    current_year = 2025
    if grade == '유아':
        year = random.randint(current_year - 7, current_year - 3)
    elif grade == '초등':
        year = random.randint(current_year - 13, current_year - 8)
    elif grade == '중등':
        year = random.randint(current_year - 16, current_year - 14)
    elif grade == '고등':
        year = random.randint(current_year - 19, current_year - 17)
    else:  # 성인
        year = random.randint(current_year - 65, current_year - 20)
    
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return f'{year}-{month:02d}-{day:02d}'

def generate_timestamp(booth_idx):
    """부스별 시간대 생성 (09:00 ~ 18:00)"""
    base_time = datetime(2025, 6, 15, 9, 0, 0)
    # 각 부스마다 시간대를 조금씩 다르게
    offset_hours = booth_idx * 0.5
    minutes = random.randint(0, 540)  # 9시간 = 540분
    timestamp = base_time + timedelta(hours=offset_hours, minutes=minutes)
    return timestamp.strftime('%Y-%m-%d %H:%M:%S')

def generate_sql():
    """SQL 파일 생성"""
    sql_lines = []
    
    # 헤더
    sql_lines.append('-- ========================================')
    sql_lines.append('-- 교육용 테스트 데이터 (자동 생성)')
    sql_lines.append('-- 생성 시간: ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    sql_lines.append('-- ========================================\n')
    
    # 1. 테스트 행사
    sql_lines.append('-- 1. 테스트 행사 생성')
    sql_lines.append("INSERT INTO events (name, start_date, end_date, is_active) VALUES")
    sql_lines.append("('테스트 행사', '2025-06-15', '2025-06-15', 1);\n")
    
    # 2. 10개 부스
    sql_lines.append('-- 2. 10개 부스 생성')
    sql_lines.append("INSERT INTO booths (event_id, name, booth_code) VALUES")
    booth_values = []
    for i, booth in enumerate(BOOTHS, 1):
        booth_values.append(f"(1, '{booth['name']}', '{booth['code']}')")
    sql_lines.append(',\n'.join(booth_values) + ';\n')
    
    # 3. 참가자 데이터 생성
    sql_lines.append('-- 3. 참가자 데이터 생성 (총 약 1,590명)')
    sql_lines.append('-- 운영자 로그인: 각 부스의 booth_code로 로그인 (TEST01 ~ TEST10)\n')
    
    # 중복 방문을 위한 베이스 참가자 풀 생성
    base_participants = []
    for _ in range(1200):  # 1200명의 고유 참가자
        gender = random.choice(GENDERS)
        grade = random.choice(GRADES)
        base_participants.append({
            'name': generate_name(gender),
            'gender': gender,
            'grade': grade,
            'birth': generate_birth_date(grade)
        })
    
    # 각 부스별 참가자 할당
    for booth_idx, booth in enumerate(BOOTHS, 1):
        sql_lines.append(f"-- 부스 {booth_idx}: {booth['name']} ({booth['target']}명)")
        sql_lines.append(f"INSERT INTO participants (booth_id, name, gender, grade, date_of_birth, created_at) VALUES")
        
        participants_for_booth = []
        target_count = booth['target']
        
        # 80%는 베이스에서, 20%는 새로 생성 (중복 시뮬레이션)
        for i in range(target_count):
            if i < target_count * 0.8:
                # 베이스 풀에서 랜덤 선택
                p = random.choice(base_participants)
            else:
                # 이미 다른 부스 방문한 사람 (중복 방문)
                p = random.choice(base_participants)
            
            timestamp = generate_timestamp(booth_idx - 1)
            participants_for_booth.append(
                f"({booth_idx}, '{p['name']}', '{p['gender']}', '{p['grade']}', '{p['birth']}', '{timestamp}')"
            )
        
        # 50개씩 나눠서 INSERT (SQL 길이 제한 방지)
        for i in range(0, len(participants_for_booth), 50):
            batch = participants_for_booth[i:i+50]
            if i > 0:
                sql_lines.append("INSERT INTO participants (booth_id, name, gender, grade, date_of_birth, created_at) VALUES")
            sql_lines.append(',\n'.join(batch) + ';\n')
    
    # 5. 통계 정보
    total_participants = sum(booth['target'] for booth in BOOTHS)
    sql_lines.append(f'\n-- ========================================')
    sql_lines.append(f'-- 생성 완료!')
    sql_lines.append(f'-- 총 부스: 10개')
    sql_lines.append(f'-- 총 방문: {total_participants}명')
    sql_lines.append(f'-- 고유 참가자: 약 1,200명 (중복 방문 포함)')
    sql_lines.append(f'-- ========================================')
    sql_lines.append(f'--')
    sql_lines.append(f'-- 운영자 로그인 방법:')
    sql_lines.append(f'--   - URL: http://localhost:3000/operator')
    sql_lines.append(f'--   - Booth Code 입력: TEST01, TEST02, ..., TEST10')
    sql_lines.append(f'-- ========================================')
    
    return '\n'.join(sql_lines)

if __name__ == '__main__':
    print('🎲 교육용 테스트 데이터 생성 중...')
    sql_content = generate_sql()
    
    with open('seed-test.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print('✅ seed-test.sql 파일 생성 완료!')
    print(f'📊 파일 크기: {len(sql_content):,} bytes')
    print('')
    print('📝 생성된 데이터:')
    print('   - 행사: 1개 (테스트 행사)')
    print('   - 부스: 10개 (TEST01 ~ TEST10)')
    print('   - 참가자: 약 1,590명 (중복 방문 포함)')
    print('')
    print('🔐 운영자 로그인:')
    print('   - URL: http://localhost:3000/operator')
    print('   - Booth Code: TEST01 ~ TEST10')
    print('')
    print('🚀 적용 방법:')
    print('   cd /home/user/webapp')
    print('   npx wrangler d1 execute guestbook-production --local --file=./seed-test.sql')
