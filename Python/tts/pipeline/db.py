import psycopg2
from psycopg2.extras import execute_values
from config import DB_CONFIG

def save_to_postgresql(news_text, dong_list):
    conn = psycopg2.connect(**DB_CONFIG)
    with conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM redevelopment_dong;")
            execute_values(
                cur,
                "INSERT INTO redevelopment_dong (dong_name) VALUES %s",
                [(dong,) for dong in dong_list]
            )
            cur.execute(
                "INSERT INTO news_prompt (new_prompt, created_at) VALUES (%s, NOW())",
                (news_text,)
            )
    print("✅ DB 저장 완료")
