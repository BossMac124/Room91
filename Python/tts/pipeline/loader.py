import os
import pandas as pd
from datetime import datetime

def save_news_to_excel(df, base_dir, base_filename):
    if df.empty:
        print(f"⚠️ 저장할 데이터가 없습니다: {base_filename}")
        return

    os.makedirs(base_dir, exist_ok=True)
    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(base_dir, f"{base_filename}_{now_str}.xlsx")
    df.to_excel(file_path, index=False)
    print(f"📁 저장 완료: {file_path}")

def get_latest_excel_file(base_dir, prefix):
    files = [f for f in os.listdir(base_dir) if f.startswith(prefix) and f.endswith(".xlsx")]
    if not files:
        return None
    files.sort(reverse=True)
    return os.path.join(base_dir, files[0])

def get_top3_from_excel(file_paths):
    all_rows = []
    for file in file_paths:
        if not file or not os.path.exists(file):
            continue
        try:
            df = pd.read_excel(file)
            if {"제목", "요약"}.issubset(df.columns):
                all_rows.extend(df.to_dict("records"))
        except Exception as e:
            print(f"❌ 파일 불러오기 실패: {file} ({e})")
    return pd.DataFrame(all_rows).head(3)
