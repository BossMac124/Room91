from config import OUTPUT_AUDIO_PATH
from db import save_to_postgresql
from loader import save_news_to_excel, get_latest_excel_file, get_top_n_from_excel
from prompt import refine_news, extract_dong_list
from scraper import crawl_google_news_selenium, crawl_naver_news_selenium
from tts import generate_tts
from video import create_news_video

if __name__ == "__main__":
    print("🌐 실시간 뉴스 크롤링 중...")

    # ✅ 뉴스 크롤링
    google_df = crawl_google_news_selenium("서울")
    naver_df = crawl_naver_news_selenium("서울")

    if google_df.empty and naver_df.empty:
        print("❌ 뉴스 크롤링 실패: 가져온 뉴스가 없습니다.")
        exit(1)

    print("✅ Google 뉴스 예시:\n", google_df.head(1))
    print("✅ Naver 뉴스 예시:\n", naver_df.head(1))

    # ✅ 엑셀 저장
    base_dir = "crawl"
    save_news_to_excel(google_df, base_dir, "서울_재개발_Google")
    save_news_to_excel(naver_df, base_dir, "서울_재개발_Naver")

    # ✅ 최신 뉴스 3건 불러오기
    google_file = get_latest_excel_file(base_dir, "서울_재개발_Google")
    naver_file = get_latest_excel_file(base_dir, "서울_재개발_Naver")
    df_top4 = get_top_n_from_excel([google_file, naver_file], top_n=4)


    # ✅ 뉴스 정제 및 통합
    full_text = ""
    for _, row in df_top4.iterrows():
        script = f"{row['제목']}\n{row['요약']}"
        print(f"🧠 뉴스 정제 중: {row['제목'][:30]}...")
        refined = refine_news(script)
        full_text += refined + "\n\n"

    if not full_text.strip():
        print("❌ 뉴스 정제 실패: 생성된 뉴스가 없습니다.")
        exit(1)

    print(f"🧾 뉴스 바이트 길이: {len(full_text.encode('utf-8'))}B")

    # ✅ TTS 생성 + 영상 생성
    try:
        generate_tts(full_text, OUTPUT_AUDIO_PATH)
        create_news_video(OUTPUT_AUDIO_PATH)  # 썸네일 랜덤 선택 + 날짜별 저장 포함
    except Exception as e:
        print(f"❌ TTS 또는 영상 생성 실패: {e}")
        exit(1)

    # ✅ 동 리스트 추출
    dong_list = extract_dong_list(full_text)
    if not dong_list:
        print("❌ 동 리스트 추출 실패")
        exit(1)

    print("📌 추출된 동 리스트:", dong_list)

    # ✅ DB 저장
    try:
        save_to_postgresql(full_text, dong_list)
        print("✅ 모든 작업 완료")
    except Exception as e:
        print(f"❌ DB 저장 실패: {e}")
        exit(1)
