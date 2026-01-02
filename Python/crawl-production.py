import random
import time

import requests
import pandas as pd
from datetime import datetime
import pymongo
from pymongo import MongoClient, GEOSPHERE
import ast
import openpyxl


# ============================================
# 1) 민우가 Network 탭에서 복사해 넣는 부분
# ============================================

AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NjM5NTU3ODUsImV4cCI6MTc2Mzk2NjU4NX0.GuwHErMt91YZENqv5gkTsu9kUcZz5LBkFJ4B0Z_GKnA"

COOKIES = {
    "NNB": "ZE56L4QRISEGO",
    "NaverSuggestUse": "use%26unuse",
    "_tt_enable_cookie": "1",
    "_ttp": "di8VgjkVnELQOO705RZ5q90Lojf.tt.1",
    "NID_AUT": "Ddsi4waEjvK/J/g6jAizy8ci+Vi7mPyBkR/P6jO74JHznzPgpP0eAhFaMEayriT1",
    "NID_JKL": "vzHuITawqRb4mXvi4iELZ2zADu8KwGwJ9U/HCkK9IiI=",
    "_ga_451MFZ9CFM": "GS1.1.1742808244.1.1.1742808487.0.0.0",
    "ASID": "df264e5600000196f2b19d8f0000004b",
    "_ga_8P4PY65YZ2": "GS2.1.s1749018449$o1$g1$t1749018657$j2$l0$h0",
    "_fbp": "fb.1.1751889528537.74745202520240513",
    "ttcsid_CT81OARC77UF2P2A5FGG": "1751889528744::VKSFyokIm1ztdojnD2p1.1.1751889528950",
    "NV_WETR_LAST_ACCESS_RGN_M": '"MDIyMjAxMDE="',
    "NV_WETR_LOCATION_RGN_M": '"MDIyMjAxMDE="',
    "ttcsid_D1S4F2JC77U51PG3K2GG": "1753117137264::zGK4S0D1AEjMUwOU107J.2.1753117171350",
    "bnb_tooltip_shown_finance_v1": "true",
    "ttcsid": "1756315186770::IgVHWHE8nYhtXltjbWe6.5.1756315186770",
    "ttcsid_CRLT6VRC77UC5E4HNKOG": "1756315186769::3ZiC-FkFRAuuLDxD_eb1.2.1756315186976",
    "_ga_NFRXYYY5S0": "GS2.1.s1756315186$o3$g0$t1756315192$j54$l0$h0",
    "_ga_9JHCQLWL5X": "GS2.1.s1756315186$o3$g0$t1756315192$j54$l0$h0",
    "_ga_Q7G1QTKPGB": "GS2.1.s1756315186$o3$g0$t1756315192$j54$l0$h0",
    "_ga": "GA1.2.1217310442.1739851609",
    "NAC": "NHnuBwQpGYgo",
    "NACT": "1",
    "page_uid": "jfKgelqVOZossCkGdxNssssssqd-232762",
    "NID_SES": "AAABqN08lSyfNcRQRQFM6jsAogC0my+P8N1GGlrlkELeCGngyTlya0R8/kvH8vInChj1GDsgZgR5ane+1aon1MDFqRQikTHXAucKegGzEWVm9NXeB3MMzByDokV/t7VAu5Mz8V0QW+Gpl1jW8wkoZhdgkRsSS1OZrFc1cHu4TYXEWSRdQHWcfmrJ+SV8+NqIgXxtkXI+8SWjPbPxZ45RdHhHrsuLs9N/iQOiMXiLymO+F0Rsleybnya3/FnMow8urPRKxb4B/oCrgsQqCEMqk9GVFqiwOR7BACbFyNj3andHSwnHF/H9bboDWMsVgG8plqCAhf6QfMrbqp3pV9D2trc2h/ZEC9igQjbXrf2PB7C5mCUSaPT4332VC6c/G1Ds8V1wqTfOkGEM5KN3XhSNHbWi4oGuFwlsI1C/Fr4YdsKwqkSrDHfWFZYPJpEQVMAbl9N0ilLY1KOu4QhtFkMprJ/B802NDluYYLqfIAtUjCTIRhN000hU90X86VErjAOGawf6eeVSLm0GU3AExWJ98m1GtruQhrPza7BILZCK8D1HQ2ASIsinf/0EKAe8Tmd6k6SzCw==",
    "SRT30": "1763953927",
    "SRT5": "1763953927",
    "BUC": "xr9aMJqneNHkxbK0xkNwHReygSBZSYy5BypfM5Slze8="
}


HEADERS = {
    "authority": "new.land.naver.com",
    "accept": "*/*",
    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "authorization": AUTH_TOKEN,
    "priority": "u=1, i",
    "referer": "https://new.land.naver.com/rooms",
    "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
}


# ============================================
# 2) cortarNo 기반 API (네트워크 탭 기준)
# ============================================

API_TEMPLATE = (
    "https://new.land.naver.com/api/articles?"
    "cortarNo={cortarNo}"
    "&order=rank"
    "&realEstateType=APT:OPST:ABYG:OBYG:GM:OR:DDDGG:JWJT:SGJT:VL"
    "&priceType=RETAIL"
    "&page={page}"
    "&articleState="
)


# ============================================
# 3) 단일 region 크롤링 함수
# ============================================

def fetch_region_articles(cortarNo, region_name):
    results = []
    page = 1

    while True:
        url = API_TEMPLATE.format(cortarNo=cortarNo, page=page)

        # rate limit 우회
        time.sleep(random.uniform(0.8, 1.3))

        res = requests.get(url, headers=HEADERS, cookies=COOKIES)

        print("status:", res.status_code)

        if res.status_code == 429:
            print("🚫 429 발생 → 5초 쉬었다 재시도")
            time.sleep(5)
            continue

        if res.status_code != 200:
            print(f"❌ {region_name} 페이지 {page} 오류:", res.status_code)
            break

        data = res.json()
        articles = data.get("articleList", [])

        if not articles:
            break

        for a in articles:
            a["region"] = region_name

        results.extend(articles)

        if not data.get("isMoreData", False):
            break

        page += 1

    print(f"🌈 {region_name} 수집 완료: {len(results)} 건")
    return results


# ============================================
# 4) 강남, 구로 등 행정동 cortarNo 예시
# ============================================

regions = {
    "역삼동": "1168010100",
    "개포동": "1168010300",
    "대치동": "1168010600",
    # 필요하면 민우가 원하는 동 전체 넣으면 돼
}

all_data = {}
for region, code in regions.items():
    all_data[region] = fetch_region_articles(code, region)


# ============================================
# 5) 엑셀 저장
# ============================================

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
xlsx_filename = f"naver_oneroom_{timestamp}.xlsx"

with pd.ExcelWriter(xlsx_filename) as writer:
    for region, rows in all_data.items():
        df = pd.DataFrame(rows)
        if len(df) > 0:
            df.to_excel(writer, sheet_name=region, index=False)

print("📁 Excel 저장 완료:", xlsx_filename)
