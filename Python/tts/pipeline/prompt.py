import ast

import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def refine_news(script_text):
    prompt = f"""
    다음 텍스트를 뉴스 기사처럼 정제해 주세요. 부동산과 관련 없는 내용은 제거하고, 부동산 관련 정보만 포함해 주세요.
    문장은 자연스럽고 아나운서가 읽을 수 있도록 완성도 있게 작성하며, "~다" 대신 "~습니다"로 마무리합니다.
    텍스트 길이는 UTF-8 기준 5000바이트를 넘지 않도록 요약해주세요.

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
    아래 뉴스 텍스트에서 서울시 내 재개발 가능성이 높은 **동(동으로 끝나는 지역명)**만 추출해 주세요.

    조건:
    1. "동"으로 끝나는 이름만 리스트에 포함. (예: 개포동, 신사동)
    2. "구", "시", "면", "읍" 등으로 끝나는 단어는 절대 포함하지 말 것.
    3. 뉴스에 직접 언급되지 않아도 맥락상 개발 가능성이 높은 '동'이라면 포함 가능.
    4. 출력은 반드시 **Python 리스트 형식만** 사용. (예: ["개포동", "신사동"])
    5. 절대 설명 없이 **리스트만 출력**.

    뉴스 텍스트:
    {script_text}
    """

    for attempt in range(3):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "너는 서울 동 이름을 추출하는 어시스턴트야."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7,
                timeout=30
            )
            content = response['choices'][0]['message']['content'].strip()

            # 문자열을 안전하게 리스트로 파싱
            dong_list = ast.literal_eval(content)
            if isinstance(dong_list, list):
                # ✅ 중복 제거 + '동'으로 끝나는 항목만 필터링 + 정렬
                dong_list = [dong for dong in dong_list if dong.endswith("동")]
                dong_list = sorted(set(dong_list))
                return dong_list
        except Exception as e:
            print(f"❌ 동 리스트 파싱 실패 (Attempt {attempt+1}):", e)
            continue

    return []