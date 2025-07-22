from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import pandas as pd


def init_driver():
    options = Options()
    # options.add_argument("--headless=new")  # UI 없이 실행할 때만 주석 해제
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("lang=ko_KR")
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


def crawl_google_news_selenium(keyword, max_results=10):
    driver = init_driver()
    url = f"https://www.google.com/search?q={keyword}+재개발&hl=ko&tbm=nws"
    driver.get(url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.SoaBEf"))
        )
    except:
        print("❌ 구글 뉴스 로딩 실패 (요소 탐색 실패)")
        driver.quit()
        return pd.DataFrame()

    articles = driver.find_elements(By.CSS_SELECTOR, "div.SoaBEf")
    print(f"🔎 구글 뉴스 기사 수: {len(articles)}")
    data = []

    for article in articles[:max_results]:
        try:
            title_tag = article.find_element(By.CSS_SELECTOR, 'div[role="heading"]')
            title = title_tag.text.strip()
            link = article.find_element(By.TAG_NAME, "a").get_attribute("href")
            snippet = article.find_element(By.CSS_SELECTOR, "div:nth-child(3)").text.strip()
            data.append({
                "제목": title,
                "링크": link,
                "요약": snippet,
                "정보_원천": "Google",
                "크롤링_시간": datetime.now()
            })
        except Exception as e:
            print("❌ 구글 뉴스 파싱 실패:", e)
            continue

    driver.quit()
    return pd.DataFrame(data)


def crawl_naver_news_selenium(keyword, max_results=10):
    driver = init_driver()
    url = f"https://search.naver.com/search.naver?where=news&query={keyword}+재개발"
    driver.get(url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, "span.sds-comps-text-type-headline1"))
        )
    except:
        print("❌ 네이버 뉴스 로딩 실패 (요소 탐색 실패)")
        driver.quit()
        return pd.DataFrame()

    titles = driver.find_elements(By.CSS_SELECTOR, "span.sds-comps-text-type-headline1")
    bodies = driver.find_elements(By.CSS_SELECTOR, "span.sds-comps-text-type-body1")
    links = driver.find_elements(By.CSS_SELECTOR, "a[href^='https://']")

    print(f"🔎 네이버 뉴스 제목 수: {len(titles)}")

    data = []
    for i in range(min(max_results, len(titles))):
        try:
            title = titles[i].text.strip()
            snippet = bodies[i].text.strip() if i < len(bodies) else ""
            link = links[i].get_attribute("href")
            data.append({
                "제목": title,
                "링크": link,
                "요약": snippet,
                "정보_원천": "Naver",
                "크롤링_시간": datetime.now()
            })
        except Exception as e:
            print("❌ 네이버 뉴스 파싱 실패:", e)
            continue

    driver.quit()
    return pd.DataFrame(data)
