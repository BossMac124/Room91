import os

import toml
from google.oauth2 import service_account

# 현재 파일 기준 상위 디렉토리에 있는 secrets.toml 경로를 계산
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOML_PATH = os.path.join(BASE_DIR, "../secrets.toml")  # ← 상위 폴더에 있으면 이렇게

# secrets.toml 로드
secrets = toml.load(TOML_PATH)

# 키 불러오기
OPENAI_API_KEY = secrets["general"]["OPENAI_API_KEY"]
GOOGLE_CREDENTIAL_PATH = secrets["google"]["GOOGLE_CREDENTIAL_PATH"]
GOOGLE_CREDENTIAL = service_account.Credentials.from_service_account_file(GOOGLE_CREDENTIAL_PATH)

print("✅ OPENAI_API_KEY:", OPENAI_API_KEY[:8])  # 앞부분만 출력해서 확인

OUTPUT_AUDIO_PATH = "output/news_audio.mp3"
GOOGLE_EXCEL_FILE = "crawl/서울_재개발_Google.xlsx"
NAVER_EXCEL_FILE = "crawl/서울_재개발_Naver.xlsx"

DB_CONFIG = {
    "dbname": "housing",
    "user": "postgres",
    "password": "1234",
    "host": "localhost",
    "port": "5432",
}