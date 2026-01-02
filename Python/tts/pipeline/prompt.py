import ast

import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def refine_news(script_text):
    global refined_text
    prompt = f"""
    다음 텍스트를 뉴스 기사처럼 정제해 주세요.

    주의:
    1. 원문에 등장한 **행정동(반포동, 신사동, 개포동 등)** 이름은 절대 삭제하지 마세요.
    2. 행정동 이름이 나오면 반드시 문장에 그대로 포함하세요.
    3. 부동산과 관련 없는 내용만 제거하세요.
    4. 문장은 아나운서가 읽을 수 있도록 자연스럽게 구성하고, 문장 끝은 "~습니다"로 마무리합니다.
    5. 텍스트 길이는 UTF-8 기준 5000바이트를 넘지 않도록 요약해주세요.
    
    텍스트:
    {script_text}
    """

    for attempt in range(3):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
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
                print(f"⚠️ 바이트 초과. {len(refined_text.encode('utf-8'))}B → 재시도 중...")
                prompt = f"아래 텍스트를 더 간결하게 5000바이트 이하로 줄여줘:\n{refined_text}"
        except Exception as e:
            print(f"OpenAI 응답 실패 (정제): {e}")
            return ""

    return refined_text.encode('utf-8')[:5000].decode('utf-8', 'ignore')


def extract_dong_list(script_text):
    prompt = f"""
    아래 뉴스 텍스트에서 서울시 내 '동'으로 끝나는 지역명만 추출해 주세요.

    규칙:
    1. 반드시 "동"으로 끝나는 단어만 리스트에 포함하세요. (예: 반포동, 신사동)
    2. "구", "시", "구역", "지역", "일대" 등은 제외합니다.
    3. 뉴스에 직접 언급되지 않은 동을 추론해서 포함하지 않습니다.
    4. 동 이름이 하나도 없으면 빈 리스트([])만 출력하세요.
    5. 출력은 반드시 **Python 리스트 형태**로만 출력하세요.
    6. 절대 리스트 외의 설명은 넣지 마세요.

    뉴스 텍스트:
    {script_text}
    """

    for attempt in range(3):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "너는 서울 동 이름만 리스트로 추출하는 어시스턴트야."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.2,
                timeout=20
            )
            raw = response["choices"][0]["message"]["content"].strip()

            # 1) 응답이 리스트 형태인지 강제 검사
            cleaned = raw.strip()
            if not (cleaned.startswith("[") and cleaned.endswith("]")):
                print("⚠️ 비정상 응답 → 재시도:", cleaned)
                continue

            # 2) 리스트 파싱
            dong_list = ast.literal_eval(cleaned)

            # 3) 값 정제
            dong_list = [dong for dong in dong_list if isinstance(dong, str) and dong.endswith("동")]
            dong_list = sorted(set(dong_list))
            return dong_list

        except Exception as e:
            print(f"❌ 동 리스트 파싱 실패 (Attempt {attempt+1}):", e)
            continue

    return []