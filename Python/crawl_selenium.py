from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import json
import time


# 네이버 API 호출 함수
def fetch_articles_with_selenium(driver, cortarNo, page=1):
    js_code = f"""
    return fetch(
        "https://new.land.naver.com/api/articles?cortarNo={cortarNo}&page={page}&order=rank"
        + "&realEstateType=APT%3AOPST%3AABYG%3AOBYG%3AGM%3AOR%3AVL%3ADDDGG%3AJWJT%3ASGJT%3AHOJT"
        + "&priceType=RETAIL&sameAddressGroup=false"
    )
    .then(r => r.json())
    .catch(e => {{ return {{ error: e.toString() }} }});
    """
    return driver.execute_script(js_code)


# 크롬 시작 함수
def start_browser():
    options = webdriver.ChromeOptions()

    # ⭐ Profile 1 전체를 user-data-dir 로 지정
    options.add_argument(
        'user-data-dir=/Users/kangminwoo/Library/Application Support/Google/Chrome/Profile 1'
    )

    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    return driver


def main():
    driver = start_browser()

    print("네이버 부동산 페이지 여는 중...")
    driver.get("https://new.land.naver.com/rooms")

    print("⏳ 민우 로그인 세션 확인 중...")
    time.sleep(8)

    # 테스트 요청
    cortarNo = "1168010100"  # 역삼동 cortarNo
    print(f"📌 역삼동(cortarNo={cortarNo}) 1페이지 요청")

    data = fetch_articles_with_selenium(driver, cortarNo, page=1)

    print("\n===== API 응답 =====")
    print(json.dumps(data, indent=2, ensure_ascii=False))

    driver.quit()


if __name__ == "__main__":
    main()
