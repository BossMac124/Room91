from datetime import datetime

import psycopg2
from psycopg2.extras import execute_values
from config import DB_CONFIG

def save_to_postgresql(news_text, dong_list):
    conn = psycopg2.connect(**DB_CONFIG)
    with conn:
        with conn.cursor() as cur:
            # ✅ 1. created_at 직접 지정
            created_at = datetime.now()

            # ✅ 2. refined_news에 저장하면서 created_at도 함께 넣기
            cur.execute(
                """
                INSERT INTO refined_news (news_text, created_at)
                VALUES (%s, %s)
                    RETURNING id;
                """,
                (news_text, created_at)
            )
            news_id = cur.fetchone()[0]

            # ✅ 3. 관련 동을 redevelopment_dong에 저장
            if dong_list:
                execute_values(
                    cur,
                    "INSERT INTO redevelopment_dong (dong_name, news_id) VALUES %s",
                    [(dong, news_id) for dong in dong_list]
                )

    print(f"✅ DB 저장 완료 (뉴스 ID: {news_id}, 생성일: {created_at})")