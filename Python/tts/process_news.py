import pandas as pd
import os
import openai
import toml
import re
from google.cloud import texttospeech
from google.oauth2 import service_account
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values

# secrets.toml 파일에서 API 키 읽기
secrets = toml.load("secrets.toml")

# OpenAI API 키 설정
openai.api_key = secrets["general"]["OPENAI_API_KEY"]

# 서비스 계정 키 파일 경로 (Google Cloud TTS)
credentials = service_account.Credentials.from_service_account_file(
    '/Users/kimhanseop/Downloads/tts-real-estate-c725ae21da85.json'
)

# Text-to-Speech 클라이언트 객체 생성
client = texttospeech.TextToSpeechClient(credentials=credentials)

# 엑셀 파일 경로
excel_files = [
    "/Users/kimhanseop/Desktop/FastCampus_Housing/Python/tts/크롤링/서울 재개발 - Google 검색.xlsx",
    "/Users/kimhanseop/Desktop/FastCampus_Housing/Python/tts/크롤링/서울 재개발 - Naver 검색.xlsx",
    "/Users/kimhanseop/Desktop/FastCampus_Housing/Python/tts/크롤링/서울 재개발 – Daum 검색.xlsx"
]

df_list = []
for file in excel_files:
    try:
        # 파일 읽기
        df = pd.read_excel(file)
        print(f"파일 {file}이 성공적으로 로드되었습니다.")
        # 파일별로 필요한 컬럼만 선택
        if "Google" in file:
            df = df[['제목', '제목_링크', '이미지', 'osrxxb']]
        elif "Naver" in file:
            df = df[['제목', '타이틀', '정보']]
        elif "Daum" in file:
            df = df[['제목', '타이틀', '정보5']]
        df_list.append(df)
    except Exception as e:
        print(f"파일 {file}을(를) 로드하는 동안 오류 발생: {e}")

if df_list:
    df = pd.concat(df_list, ignore_index=True)
    print("데이터프레임 병합 완료!")
else:
    print("병합할 데이터프레임이 없습니다.")

# 시간 정보를 파싱하는 함수 (예: "3시간 전", "1일 전" 등)
def parse_time_diff(time_str):
    time_patterns = {
        "시간": r"(\d+)\s*시간",
        "일": r"(\d+)\s*일",
        "분": r"(\d+)\s*분",
        "주": r"(\d+)\s*주"
    }
    now = datetime.now()
    if isinstance(time_str, str):
        if "시간 전" in time_str:
            hours = int(re.search(time_patterns["시간"], time_str).group(1))
            return now - timedelta(hours=hours)
        elif "일 전" in time_str:
            days = int(re.search(time_patterns["일"], time_str).group(1))
            return now - timedelta(days=days)
        elif "분 전" in time_str:
            minutes = int(re.search(time_patterns["분"], time_str).group(1))
            return now - timedelta(minutes=minutes)
        elif "주 전" in time_str:
            weeks = int(re.search(time_patterns["주"], time_str).group(1))
            return now - timedelta(weeks=weeks)
    return now

# 시간 정보를 기준으로 최신 뉴스 정렬
if 'osrxxb' in df.columns:
    df['parsed_time'] = df['osrxxb'].apply(parse_time_diff)
elif '정보' in df.columns:
    df['parsed_time'] = df['정보'].apply(parse_time_diff)
elif '정보5' in df.columns:
    df['parsed_time'] = df['정보5'].apply(parse_time_diff)

df_sorted = df.sort_values(by='parsed_time', ascending=False)
df_top_3 = df_sorted.head(3)

# 'script' 컬럼 생성: 제목과 설명 결합
def get_description(row, file_name):
    if "Google" in file_name:
        return row['osrxxb']
    elif "Naver" in file_name:
        return row['정보']
    elif "Daum" in file_name:
        return row['정보5']
    return ''

# df_top_3 복사본 생성 후 'script' 컬럼 수정
df_top_3 = df_top_3.copy()
df_top_3.loc[:, 'script'] = df_top_3.apply(lambda row: f"{row['제목']}\n{get_description(row, file)}", axis=1)

# OpenAI를 통해 뉴스 정제: 최종 텍스트가 5000바이트 이하가 되도록 요청
def refine_news_with_openai(script_text):
    prompt = f"""
    다음 텍스트를 진짜 뉴스처럼 정제해 주세요.
    부동산과 관련 없는 내용은 모두 제외하고, 부동산 관련 정보만 참고하여, 최종 텍스트의 전체 UTF-8 바이트 수가 5000바이트를 넘지 않도록 요약해 주시기 바랍니다.
    또한 문장 끝은 "~다"가 아닌 "~습니다"로 마무리하고, 맥락에 맞춰 자연스럽게 작성하여 하나의 완성된 뉴스 기사를 만들어 주세요.
    정제 완성본은 정말 아나운서가 대본을 보고 읽는것처럼 자연스럽게 말해야하면 불필요한 제목 이런 단어는 제거해줘
    말이 끊기지 않게 마무리해 맨마지막에 말이 너무 끊기는데 말이이어지지않으면 넣지말아줘

    {script_text}
    """
    max_attempts = 3
    for attempt in range(max_attempts):
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7,
            timeout=30
        )
        refined_text = response['choices'][0]['message']['content'].strip()
        if len(refined_text.encode('utf-8')) <= 5000:
            return refined_text
        else:
            print(f"Attempt {attempt+1}: 텍스트 길이 {len(refined_text.encode('utf-8'))} 바이트 (5000바이트 초과)")
            prompt = f"아래 텍스트를 5000바이트 이하로 요약해 주세요:\n{refined_text}"
    # 안전하게 최종 텍스트를 5000바이트로 잘라서 반환
    truncated = refined_text.encode('utf-8')[:5000].decode('utf-8', 'ignore')
    return truncated

# OpenAI를 통해 뉴스 정제: 최종 텍스트가 5000바이트 이하가 되도록 요청
def region_list(script_text):
    prompt = f"""
    아래 뉴스 텍스트를 읽고, 해당 뉴스에 언급된 지역 중에서 향후 **재개발 가능성이 높거나, 사람들의 유입이 많아질 가능성이 높은 서울특별시 내 동(행정동 또는 법정동)만** 골라주세요.

    조건은 아래와 같습니다:

    1. 반드시 **"동"으로 끝나는 이름만** 리스트에 포함해 주세요. 예: 신사동, 개포동, 청담동
    2. **"구", "시", "면", "읍" 등으로 끝나는 단어는 절대 포함하지 마세요.** 예: 중랑구 ❌, 노원구 ❌
    3. 뉴스에서 직접 언급되지 않았더라도, **뉴스 내용 상 추론되는 개발 가능성 지역**이 있다면 포함해 주세요.
    4. 결과는 반드시 **Python 리스트** 형식으로만 출력해 주세요. 예: ["개포동", "신사동", "청담동"]
    5. **설명 없이 리스트만 출력해 주세요.**

    뉴스 텍스트:
    {script_text}
    """

    max_attempts = 3
    for attempt in range(max_attempts):
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system",
                 "content": "You are a helpful assistant that extracts legal district names in Seoul from text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7,
            timeout=30
        )
        refined_text = response['choices'][0]['message']['content'].strip()
        if len(refined_text.encode('utf-8')) <= 5000:
            return refined_text
        else:
            print(f"Attempt {attempt + 1}: 텍스트 길이 {len(refined_text.encode('utf-8'))} 바이트 (5000바이트 초과)")
            prompt = f"아래 텍스트를 5000바이트 이하로 요약해 주세요:\n{refined_text}"

    # 마지막 보정: 5000바이트 초과할 경우 잘라서 반환
    list = refined_text.encode('utf-8')[:5000].decode('utf-8', 'ignore')
    return list


# 전체 뉴스 텍스트 결합 (최신 30개 데이터만)
full_news_text = ""
for idx, row in df_top_3.iterrows():
    refined_script = refine_news_with_openai(row['script'])
    full_news_text += refined_script + "\n\n"


# 최종 뉴스 텍스트 바이트 길이 확인
print("최종 뉴스 텍스트 바이트 길이:", len(full_news_text.encode('utf-8')))

# 최종 뉴스 텍스트가 5000바이트 이하인지 확인 (TTS API 제한)
if len(full_news_text.encode('utf-8')) > 5000:
    print("최종 뉴스 텍스트가 5000바이트를 초과합니다. Long Audio API 사용을 고려하세요.")
    # 여기서 필요한 경우 Long Audio API로 전환하거나 추가 요약을 수행할 수 있습니다.
    # 또는 강제로 truncate 할 수도 있습니다:
    full_news_text = full_news_text.encode('utf-8')[:5000].decode('utf-8', 'ignore')

# 하나의 음성 파일로 변환
output_dir = "output/news_audio.mp3/"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "full_news_audio.mp3")

def generate_tts(text, output_path):
    input_text = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )
    response = client.synthesize_speech(
        request={"input": input_text, "voice": voice, "audio_config": audio_config}
    )
    with open(output_path, "wb") as out:
        out.write(response.audio_content)
    print(f"음성 파일이 {output_path}에 저장되었습니다.")

generate_tts(full_news_text, output_path)



# 1. 뉴스 기반 추출된 동 리스트
dong_list = region_list(full_news_text)
dong_list = eval(dong_list) if isinstance(dong_list, str) else dong_list
print(dong_list)

# 2. PostgreSQL 연결 정보
conn = psycopg2.connect(
    dbname="housing",
    user="postgres",
    password="4223",
    host="localhost",
    port="5432"
)

# 3. 기존 데이터 삭제 후 새로 저장
with conn:
    with conn.cursor() as cur:
        # 먼저 기존 데이터 모두 삭제
        cur.execute("DELETE FROM redevelopment_dong;")
        print("🧹 기존 데이터 삭제 완료")

        # 새로운 동 리스트 삽입
        insert_query = """
        INSERT INTO redevelopment_dong (dong_name)
        VALUES %s
        """
        execute_values(cur, insert_query, [(dong,) for dong in dong_list])

        insert_query = """
            INSERT INTO news_prompt (new_prompt, created_at)
            VALUES (%s, NOW())
        """
        cur.execute(insert_query, (full_news_text,))

print("✅ 동 리스트, 뉴스 기사가 PostgreSQL에 새로 저장되었습니다.")