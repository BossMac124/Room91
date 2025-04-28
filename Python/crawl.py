import requests
import pandas as pd
from datetime import datetime
import pymongo
from pymongo import MongoClient, GEOSPHERE
import gridfs
import ast

# (1) 공통 쿠키와 헤더
cookies = {
    'NNB': 'TWLQSOW62SBWO',
    'NV_WETR_LAST_ACCESS_RGN_M': '"MDk2ODAxMDE="',
    'NV_WETR_LOCATION_RGN_M': '"MDk2ODAxMDE="',
    'NID_AUT': 'ftaqXiSCeM589IN4U5bQjmIRXTKTWUNZH7U2fBGqAhtRQCUFjqjXcaFNG+NHH+G7',
    'NID_JKL': 'GbUL8gBL83/6/h2lIranbhDpALqbRxwbjXcHGflcXp4=',
    '_fwb': '41tVsOcUWO8vctrMVhkHFU.1740214684403',
    'landHomeFlashUseYn': 'Y',
    '_fbp': 'fb.1.1740292798453.93482054038666276',
    '_ga': 'GA1.1.902852767.1740292799',
    '_ga_EFBDNNF91G': 'GS1.1.1740297241.2.0.1740297241.0.0.0',
    'nhn.realestate.article.rlet_type_cd': 'A01',
    'nhn.realestate.article.trade_type_cd': '""',
    'realestate.beta.lastclick.cortar': '1153000000',
    'SHOW_FIN_BADGE': 'Y',
    'page_uid': 'i90UqdqVOswssLJVgLdssssstJd-504223',
    'NID_SES': 'AAABxExUeXRwns7rPfmqcIuZFxL2nULlHX9k3tfbaI/W6WpUSw/WUun8J0yeerDQ5ipYeNTgYjjXLZYks6mMsdogpSwelzQvl14Q/yPY8S4bTgOdSaglI3gsxyT0pMvCzB9Ef0gPMP3CEsHk04JHU3poh2gU7LSqb1guH9ZHI55sx5mhN9QVAtj+oAgPS3hvLtb730CKekRtim87jaUfeIipykC5tDxSwST1zG4A2M5vx7uKU7gu7JqfbDZVULGF2h49n+2bnf5C1pUbmNvNbeqNaxvrd74P6XGP7ZiZxNT4NC5wkTbdqomQlVeWkX8VYXxQOXyNvSGJmIVSgwtg6gYVtXYNeJum/IMOnb9Ynm3vhv3O2OpYu5Z0/bQOPJZr1ee85vPGGpgn0IdhM8JAWV2phY0dZW6IQfD2zvzJHNq6cnp95kAdzkbngh1IMgjt2047Wfl+x/os1mZvnCWK7+se2GkCbkWCNv7d1WIhgXJvGsyWNAEiqmMqhu/leNbg8jqgaBbbkcLzrlpI0ZBI6kfrTthQZBdTBd6Ekjfx1hmoRMPqYHTPqWTehsGww9vX7HmpE6B5fUmdMMOW3IpXzpvk1qVoLcAxg0/tA6fl9znx4OoN',
    'SRT30': '1742618042',
    'SRT5': '1742618042',
    'BUC': 'qeJIOQrTKT-0ttRGKkKnI5h6_3EyLItn469AboigsAU=',
    'REALESTATE': 'Sat%20Mar%2022%202025%2013%3A38%3A22%20GMT%2B0900%20(Korean%20Standard%20Time)',
}

headers = {
    'accept': '*/*',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlJFQUxFU1RBVEUiLCJpYXQiOjE3NDI2MTgzMDIsImV4cCI6MTc0MjYyOTEwMn0.Af7nwnRzzwgNmnGXdm000zpGJ8PjTnuhqlOScjgfZ9Q',
    'priority': 'u=1, i',
    'referer': 'https://new.land.naver.com/rooms?ms=37.5024,126.8598,16&a=APT:OPST:ABYG:OBYG:GM:OR:VL:DDDGG:JWJT:SGJT:HOJT&e=RETAIL&aa=SMALLSPCRENT',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
}

# (2) 기본 URL 템플릿 (대부분 구간은 sameAddressGroup=false)
common_template = (
    "https://new.land.naver.com/api/articles?cortarNo={cortarNo}&order=rank"
    "&realEstateType=APT%3AOPST%3AABYG%3AOBYG%3AGM%3AOR%3AVL%3ADDDGG%3AJWJT%3ASGJT%3AHOJT"
    "&tradeType=&tag=%3A%3A%3A%3A%3A%3A%3ASMALLSPCRENT%3A"
    "&rentPriceMin=0&rentPriceMax=900000000"
    "&priceMin=0&priceMax=900000000"
    "&areaMin=0&areaMax=900000000"
    "&oldBuildYears&recentlyBuildYears"
    "&minHouseHoldCount&maxHouseHoldCount"
    "&showArticle=false&sameAddressGroup=false"
    "&minMaintenanceCost&maxMaintenanceCost"
    "&priceType=RETAIL"
    "&directions=&page={page}&articleState"
)

# 구로구의 경우 sameAddressGroup=true
guro_url_template = (
    "https://new.land.naver.com/api/articles?cortarNo={cortarNo}&order=rank"
    "&realEstateType=APT%3AOPST%3AABYG%3AOBYG%3AGM%3AOR%3AVL%3ADDDGG%3AJWJT%3ASGJT%3AHOJT"
    "&tradeType=&tag=%3A%3A%3A%3A%3A%3A%3ASMALLSPCRENT%3A"
    "&rentPriceMin=0&rentPriceMax=900000000"
    "&priceMin=0&priceMax=900000000"
    "&areaMin=0&areaMax=900000000"
    "&oldBuildYears&recentlyBuildYears"
    "&minHouseHoldCount&maxHouseHoldCount"
    "&showArticle=false&sameAddressGroup=true"
    "&minMaintenanceCost&maxMaintenanceCost"
    "&priceType=RETAIL"
    "&directions=&page={page}&articleState"
)

# 강남구의 URL 템플릿은 common_template와 동일( sameAddressGroup=false)
gangnam_url_template = common_template

# (3) 각 구별 동 및 cortarNo 매핑과 URL 템플릿 설정
# 아래 딕셔너리에 각 구별 동과 cortarNo를 추가합니다.
districts = {
    "구로구": {
        "regions": {
            "가리봉동": "1153010300",
            "개봉동": "1153010700",
            "고척동": "1153010600",
            "구로동": "1153010200",
            "궁동": "1153010900",
            "신도림동": "1153010100",
            "오류동": "1153010800",
            "온수동": "1153011000",
            "천왕동": "1153011100",
            "항동": "1153011200",
        },
        "url_template": guro_url_template,
    },
    "강남구": {
        "regions": {
            "개포동": "1168010300",
            "논현동": "1168010800",
            "대치동": "1168010600",
            "도곡동": "1168011800",
            "삼성동": "1168010500",
            "세곡동": "1168011100",
            "수서동": "1168011500",
            "신사동": "1168010700",
            "압구정동": "1168011000",
            "역삼동": "1168010100",
            "율현동": "1168011300",
            "일원동": "1168011400",
            "자곡동": "1168011200",
            "첨당동": "1168010400",
        },
        "url_template": gangnam_url_template,
    },
    "강동구": {
        "regions": {
            "강일동": "1174011000",
            "고덕동": "1174010200",
            "길동": "1174010500",
            "둔촌동": "1174010600",
            "명일동": "1174010100",
            "상일동": "1174010300",
            "성내동": "1174010800",
            "암사동": "1174010700",
            "천호동": "1174010900",
        },
        "url_template": common_template,
    },
    "강북구": {
        "regions": {
            "미아동": "1130510100",
            "번동": "1130510200",
            "수유동": "1130510300",
            "우이동": "1130510400",
        },
        "url_template": common_template,
    },
    "강서구": {
        "regions": {
            "가양동": "1150010400",
            "개화동": "1150011000",
            "공항동": "1150010800",
            "과해동": "1150011100",
            "내발산동": "1150010600",
            "등촌동": "1150010200",
            "마곡동": "1150010500",
        },
        "url_template": common_template,
    },
    "노원구": {
        "regions": {
            "공릉동": "1135010300",
            "상계동": "1135010500",
            "월계동": "1135010200",
            "중계동": "1135010600",
            "하계동": "1135010400",
        },
        "url_template": common_template,
    },
    "동대문구": {
        "regions": {
            "답십리동": "1123010500",
            "신설동": "1123010100",
            "용두동": "1123010200",
        },
        "url_template": common_template,
    },
    "서대문구": {
        "regions": {
            "남가좌동": "1141012000",
            "냉천동": "1141010500",
            "대신동/대현동": "1141011200",
        },
        "url_template": common_template,
    },
    "서초구": {
        "regions": {
            "내곡동": "1165010900",
            "반포동": "1165010700",
            "방배동": "1165010100",
            "서초동": "1165010800",
            "신원동": "1165011100",
            "양재동": "1165010200",
            "염곡동": "1165011000",
        },
        "url_template": common_template,
    },
    "성동구": {
        "regions": {
            "금호동1가": "1120010900",
            "금호동2가": "1120011000",
            "금호동3가": "1120011100",
            "금호동4가": "1120011200",
            "도선동": "1120010400",
            "마장동": "1120010500",
            "사근동": "1120010600",
        },
        "url_template": common_template,
    },
    "성북구": {
        "regions": {
            "길음동": "1129013400",
            "돈암동": "1129010300",
            "동선동1가": "1129011600",
            "동선동2가": "1129011700",
            "동선동3가": "1129011800",
            "동선동4가": "1129011900",
            "동선동5가": "1129012000",
        },
        "url_template": common_template,
    },
    "송파구": {
        "regions": {
            "가락동": "1171010700",
            "거여동": "1171011300",
            "마천동": "1171011400",
            "문정동": "1171010800",
            "방이동": "1171011100",
            "삼전동": "1171010600",
            "석촌동": "1171010500",
            "송파동": "1171010400",
            "신천동": "1171010200",
            "오금동": "1171011200",
            "잠실동": "1171010100",
            "장지동": "1171010900",
        },
        "url_template": common_template,
    },
    "영등포구": {
        "regions": {
            "당산동": "1156011700",
            "당산동1가": "1156011100",
            "당산동2가": "1156011200",
            "당산동3가": "1156011300",
            "당산동4가": "1156011400",
            "당산동5가": "1156011500",
            "당산동6가": "1156011600",
        },
        "url_template": common_template,
    },
    "용산구": {
        "regions": {
            "갈월동": "1117010400",
            "남영동": "1117010500",
            "도원동": "1117012000",
            "동빙고동": "1117013200",
            "용산동1가": "1117010600",
            "용산동2가": "1117010200",
            "용산동3가": "1117012600",
            "용산동4가": "1117010300",
            "용산동5가": "1117012700",
            "용산동6가": "1117013500",
        },
        "url_template": common_template,
    },
    "은평구": {
        "regions": {
            "갈현동": "1138010400",
            "구산동": "1138010500",
            "녹번동": "1138010200",
            "대조동": "1138010600",
        },
        "url_template": common_template,
    },
    "종로구": {
        "regions": {
            "가회동": "1111014600",
            "견지동": "1111012900",
            "경운동": "1111013400",
            "계동": "1111014800",
            "공평동": "1111012700",
        },
        "url_template": common_template,
    },
    "중구": {
        "regions": {
            "광희동1가": "1114014500",
            "광희동2가": "1114014600",
        },
        "url_template": common_template,
    },
    "중랑구": {
        "regions": {
            "망우동": "1126010500",
            "면목동": "1126010100",
            "묵동": "1126010400",
            "상봉동": "1126010200",
            "신내동": "1126010600",
            "중화동": "1126010300",
        },
        "url_template": common_template,
    },
}
# (4) 페이지별 크롤링 함수 (모든 구 동일)
def fetch_region_articles(url_template, cortarNo, region_label):
    articles = []
    page = 1
    while True:
        url = url_template.format(cortarNo=cortarNo, page=page)
        response = requests.get(url, cookies=cookies, headers=headers)
        data = response.json()
        current_articles = data.get("articleList", [])
        if not current_articles:
            break
        for article in current_articles:
            article["region"] = region_label
        articles.extend(current_articles)
        if not data.get("isMoreData", False):
            break
        page += 1
    return articles

# (5) 각 구별 데이터 수집 함수
def collect_all_articles(regions_dict, url_template, gu_label):
    all_data = []
    for dong_name, cortarNo in regions_dict.items():
        dong_articles = fetch_region_articles(url_template, cortarNo, dong_name)
        print(f"{dong_name} 수집: {len(dong_articles)}개")
        all_data.extend(dong_articles)
    print(f"[{gu_label}] 총 {len(all_data)}개 수집")
    return all_data

# (6) 모든 구의 데이터를 수집하여 딕셔너리에 저장
all_districts_data = {}
for gu, info in districts.items():
    print(f"Collecting data for {gu} ...")
    regions_dict = info["regions"]
    url_template = info["url_template"]
    gu_articles = collect_all_articles(regions_dict, url_template, gu)
    all_districts_data[gu] = gu_articles

# (7) 저장할 컬럼 순서 (총 56개)
desired_columns = [
    "region", "articleName", "tradeTypeCode", "tradeTypeName", "buildingName",
    "floorInfo", "area1", "area2", "latitude", "longitude", "direction",
    "articleConfirmYmd", "rentPrc", "tagList", "articleFeatureDesc", "verificationTypeCode",
    "isPriceModification", "dealOrWarrantPrc", "priceChangeState", "areaName", "isComplex",
    "tradeCheckedByOwner", "isDirectTrade", "representativeImgUrl", "representativeImgTypeCode",
    "representativeImgThumb", "siteImageCount", "detailAddress", "detailAddressYn", "isVrExposed",
    "elevatorCount", "sameAddrCnt", "sameAddrDirectCnt", "sameAddrMaxPrc", "sameAddrMinPrc",
    "realEstateTypeCode", "realEstateTypeName", "isLocationShow", "realtorName", "realtorId",
    "isInterest", "articleRealEstateTypeCode", "articleRealEstateTypeName", "sellerName",
    "sellerPhoneNum", "cpid", "cpName", "cpPcArticleUrl", "cpPcArticleBridgeUrl",
    "cpPcArticleLinkUseAtArticleTitleYn", "cpPcArticleLinkUseAtCpNameYn", "cpMobileArticleUrl",
    "cpMobileArticleLinkUseAtArticleTitleYn", "cpMobileArticleLinkUseAtCpNameYn", "virtualAddressYn",
    "articleStatus"
]

# (8) 파일명에 생성일시를 포함하여 Excel 파일 저장 (각 구별 시트)
timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
xlsx_filename = f"seoul_real_estate_data_{timestamp}.xlsx"

with pd.ExcelWriter(xlsx_filename) as writer:
    for gu, articles in all_districts_data.items():
        if articles:
            df = pd.DataFrame(articles).reindex(columns=desired_columns)
            df.to_excel(writer, sheet_name=gu, index=False)
        else:
            print(f"{gu}에 저장할 데이터가 없습니다.")

print(f"Excel 파일이 성공적으로 저장되었습니다: {xlsx_filename}")


# (1) MongoDB 연결
client = pymongo.MongoClient("mongodb://root:1234@localhost:27018/housing?authSource=admin")
db = client["housing"]

# (2) OneRoom, TwoRoom 컬렉션 초기화
db.drop_collection("OneRoom")
one_room_collection = db["OneRoom"]

db.drop_collection("TwoRoom")
two_room_collection = db["TwoRoom"]

one_room_collection.create_index([("location", GEOSPHERE)])
two_room_collection.create_index([("location", GEOSPHERE)])

# (4) 시트 목록 확인
sheets = pd.ExcelFile(xlsx_filename).sheet_names
print(f"엑셀 파일 시트 목록: {sheets}")

# (5) 저장할 컬럼 정의
desired_columns = [
    "region", "articleName", "tradeTypeCode", "tradeTypeName", "buildingName",
    "floorInfo", "area1", "area2", "latitude", "longitude", "direction",
    "articleConfirmYmd", "rentPrc", "tagList", "articleFeatureDesc",
    "dealOrWarrantPrc", "elevatorCount", "sameAddrCnt", "sameAddrMinPrc",
    "realtorName", "cpid", "cpName", "cpPcArticleUrl", "realEstateTypeName"
]

# (6) 시트별로 데이터 읽고 MongoDB에 조건 분기 저장
for sheet in sheets:
    df = pd.read_excel(xlsx_filename, sheet_name=sheet, engine="openpyxl")
    df = df[desired_columns]

    # ——————————————————————————————————————————
    # (A) rentPrc, elevatorCount 컬럼의 NaN 을 0 으로 채우기
    df.fillna({
        "rentPrc": 0,
        "elevatorCount": 0
    }, inplace=True)
    # ——————————————————————————————————————————

    for _, row in df.iterrows():
        document = row.to_dict()

        # ✅ tagList 문자열 → 리스트 변환
        tag_list = document.get("tagList")
        if isinstance(tag_list, str):
            try:
                parsed_list = ast.literal_eval(tag_list)
                if isinstance(parsed_list, list):
                    document["tagList"] = parsed_list
            except Exception:
                document["tagList"] = []

        # ✅ location (GeoJSON) 추가
        lon, lat = document.get("longitude"), document.get("latitude")
        if lon and lat:
            document["location"] = {
                "type": "Point",
                "coordinates": [lon, lat]
            }

        # 이제 rentPrc, elevatorCount 는 NaN 이 없고 0 으로 채워져 있습니다.

        # ✅ 조건에 따라 컬렉션 분기 저장
        if document.get("realEstateTypeName") in ("원룸", "오피스텔"):
            one_room_collection.insert_one(document)
        else:
            two_room_collection.insert_one(document)

print("엑셀 데이터를 MongoDB에 조건에 따라 OneRoom, TwoRoom으로 분리 저장했습니다.")