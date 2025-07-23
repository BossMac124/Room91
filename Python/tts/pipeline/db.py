import psycopg2
from psycopg2.extras import execute_values
from config import DB_CONFIG

def save_to_postgresql(news_text, dong_list):
    conn = psycopg2.connect(**DB_CONFIG)
    with conn:
        with conn.cursor() as cur:
            # 1. 뉴스 본문을 refined_news에 저장하고 news_id 가져오기
            cur.execute(
                "INSERT INTO refined_news (news_text) VALUES (%s) RETURNING id;",
                (news_text,)
            )
            news_id = cur.fetchone()[0]

            # 2. 관련 동을 redevelopment_dong에 저장
            if dong_list:
                execute_values(
                    cur,
                    "INSERT INTO redevelopment_dong (dong_name, news_id) VALUES %s",
                    [(dong, news_id) for dong in dong_list]
                )

    print("✅ DB 저장 완료 (뉴스 ID:", news_id, ")")
