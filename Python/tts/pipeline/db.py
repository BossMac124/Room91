from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
from config import DB_CONFIG

def save_to_postgresql(news_text, dong_list):
    conn = psycopg2.connect(**DB_CONFIG)
    with conn:
        with conn.cursor() as cur:
            # 생성 시간
            created_at = datetime.now()

            # refined_news 저장
            cur.execute(
                """
                INSERT INTO refined_news (news_text, created_at, updated_at)
                VALUES (%s, %s, %s)
                    RETURNING id;
                """,
                (news_text, created_at, created_at)   # ← updated_at 추가
            )
            news_id = cur.fetchone()[0]

            # 관련 동 저장
            if dong_list:
                execute_values(
                    cur,
                    "INSERT INTO redevelopment_dong (dong_name, news_id) VALUES %s",
                    [(dong, news_id) for dong in dong_list]
                )

    print(f"✅ DB 저장 완료 (뉴스 ID: {news_id}, 생성일: {created_at})")
