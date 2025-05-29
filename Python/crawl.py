import requests
import pandas as pd
from datetime import datetime
import pymongo
from pymongo import MongoClient, GEOSPHERE
import gridfs
import ast
import openpyxl

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
            "신도림동": "1153010100",
            "구로동": "1153010200",
            "가리봉동": "1153010300",
            "고척동": "1153010600",
            "개봉동": "1153010700",
            "오류동": "1153010800",
            "궁동": "1153010900",
            "온수동": "1153011000",
            "천왕동": "1153011100",
            "항동": "1153011200",
        },
        "url_template": common_template,
    },
    "강남구": {
        "regions": {
            "역삼동": "1168010100",
            "개포동": "1168010300",
            "청담동": "1168010400",
            "삼성동": "1168010500",
            "대치동": "1168010600",
            "신사동": "1168010700",
            "논현동": "1168010800",
            "압구정동": "1168011000",
            "세곡동": "1168011100",
            "자곡동": "1168011200",
            "율현동": "1168011300",
            "일원동": "1168011400",
            "수서동": "1168011500",
            "도곡동": "1168011800",
        },
        "url_template": common_template,
    },
    "강동구": {
        "regions": {
            "명일동": "1174010100",
            "고덕동": "1174010200",
            "상일동": "1174010300",
            "길동": "1174010500",
            "둔촌동": "1174010600",
            "암사동": "1174010700",
            "성내동": "1174010800",
            "천호동": "1174010900",
            "강일동": "1174011000",
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
            "염창동": "1150010100",
            "등촌동": "1150010200",
            "화곡동": "1150010300",
            "가양동": "1150010400",
            "마곡동": "1150010500",
            "내발산동": "1150010600",
            "외발산동": "1150010700",
            "공항동": "1150010800",
            "방화동": "1150010900",
            "개화동": "1150011000",
            "과해동": "1150011100",
            "오곡동": "1150011200",
            "오쇠동": "1150011300",
        },
        "url_template": common_template,
    },
    "관악구": {
        "regions": {
            "봉천동": "1162010100",
            "신림동": "1162010200",
            "남현동": "1162010300",
        },
        "url_template": common_template,
    },
    "광진구": {
        "regions": {
            "중곡동": "1121510100",
            "능동": "1121510200",
            "구의동": "1121510300",
            "광장동": "1121510400",
            "자양동": "1121510500",
            "화양동": "1121510700",
            "군자동": "1121510900",
        },
        "url_template": common_template,
    },
    "금천구": {
        "regions": {
            "가산동": "1154510100",
            "독산동": "1154510200",
            "시흥동": "1154510300",
        },
        "url_template": common_template,
    },
    "노원구": {
        "regions": {
            "월계동": "1135010200",
            "공릉동": "1135010300",
            "하계동": "1135010400",
            "상계동": "1135010500",
            "중계동": "1135010600",
        },
        "url_template": common_template,
    },
    "도봉구": {
        "regions": {
            "쌍문동": "1132010500",
            "방학동": "1132010600",
            "창동": "1132010700",
            "도봉동": "1132010800",
        },
        "url_template": common_template,
    },
    "동대문구": {
        "regions": {
            "신설동": "1123010100",
            "용두동": "1123010200",
            "제기동": "1123010300",
            "전농동": "1123010400",
            "답십리동": "1123010500",
            "장안동": "1123010600",
            "청량리동": "1123010700",
            "회기동": "1123010800",
            "휘경동": "1123010900",
            "이문동": "1123011000",
        },
        "url_template": common_template,
    },
    "동작구": {
        "regions": {
            "노량진동": "1159010100",
            "상도동": "1159010200",
            "상도1동": "1159010300",
            "본동": "1159010400",
            "흑석동": "1159010500",
            "동작동": "1159010600",
            "사당동": "1159010700",
            "대방동": "1159010800",
            "신대방동": "1159010900"
        },
        "url_template": common_template,
    },
    "마포구": {
        "regions": {
            "아현동": "1144010100",
            "공덕동": "1144010200",
            "신공덕동": "1144010300",
            "도화동": "1144010400",
            "용강동": "1144010500",
            "토정동": "1144010600",
            "마포동": "1144010700",
            "대흥동": "1144010800",
            "염리동": "1144010900",
            "노고산동": "1144011000",
            "신수동": "1144011100",
            "현석동": "1144011200",
            "구수동": "1144011300",
            "창전동": "1144011400",
            "상수동": "1144011500",
            "하중동": "1144011600",
            "신정동": "1144011700",
            "당인동": "1144011800",
            "서교동": "1144012000",
            "동교동": "1144012100",
            "합정동": "1144012200",
            "망원동": "1144012300",
            "연남동": "1144012400",
            "성산동": "1144012500",
            "중동": "1144012600",
            "상암동": "1144012700"
        },
        "url_template": common_template,
    },
    "서대문구": {
        "regions": {
            "충정로2가": "1141010100",
            "충정로3가": "1141010200",
            "합동": "1141010300",
            "미근동": "1141010400",
            "냉천동": "1141010500",
            "천연동": "1141010600",
            "옥천동": "1141010700",
            "영천동": "1141010800",
            "현저동": "1141010900",
            "북아현동": "1141011000",
            "홍제동": "1141011100",
            "대현동": "1141011200",
            "대신동": "1141011300",
            "신촌동": "1141011400",
            "봉원동": "1141011500",
            "창천동": "1141011600",
            "연희동": "1141011700",
            "홍은동": "1141011800",
            "북가좌동": "1141011900",
            "남가좌동": "1141012000"
        },
        "url_template": common_template,
    },
    "서초구": {
        "regions": {
            "방배동": "1165010100",
            "양재동": "1165010200",
            "우면동": "1165010300",
            "원지동": "1165010400",
            "잠원동": "1165010600",
            "반포동": "1165010700",
            "서초동": "1165010800",
            "내곡동": "1165010900",
            "염곡동": "1165011000",
            "신원동": "1165011100",
        },
        "url_template": common_template,
    },
    "성동구": {
        "regions": {
            "상왕십리동": "1120010100",
            "하왕십리동": "1120010200",
            "홍익동": "1120010300",
            "도선동": "1120010400",
            "마장동": "1120010500",
            "사근동": "1120010600",
            "행당동": "1120010700",
            "응봉동": "1120010800",
            "금호동1가": "1120010900",
            "금호동2가": "1120011000",
            "금호동3가": "1120011100",
            "금호동4가": "1120011200",
            "옥수동": "1120011300",
            "성수동1가": "1120011400",
            "성수동2가": "1120011500",
            "송정동": "1120011800",
            "용답동": "1120012200",
        },
        "url_template": common_template,
    },
    "성북구": {
        "regions": {
            "성북동": "1129010100",
            "성북동1가": "1129010200",
            "돈암동": "1129010300",
            "동소문동1가": "1129010400",
            "동소문동2가": "1129010500",
            "동소문동3가": "1129010600",
            "동소문동4가": "1129010700",
            "동소문동5가": "1129010800",
            "동소문동6가": "1129010900",
            "동소문동7가": "1129011000",
            "삼선동1가": "1129011100",
            "삼선동2가": "1129011200",
            "삼선동3가": "1129011300",
            "삼선동4가": "1129011400",
            "삼선동5가": "1129011500",
            "동선동1가": "1129011600",
            "동선동2가": "1129011700",
            "동선동3가": "1129011800",
            "동선동4가": "1129011900",
            "동선동5가": "1129012000",
            "안암동1가": "1129012100",
            "안암동2가": "1129012200",
            "안암동3가": "1129012300",
            "안암동4가": "1129012400",
            "안암동5가": "1129012500",
            "보문동4가": "1129012600",
            "보문동5가": "1129012700",
            "보문동6가": "1129012800",
            "보문동7가": "1129012900",
            "보문동1가": "1129013000",
            "보문동2가": "1129013100",
            "보문동3가": "1129013200",
            "정릉동": "1129013300",
            "길음동": "1129013400",
            "종암동": "1129013500",
            "하월곡동": "1129013600",
            "상월곡동": "1129013700",
            "장위동": "1129013800",
            "석관동": "1129013900",
        },
        "url_template": common_template,
    },
    "송파구": {
        "regions": {
            "잠실동": "1171010100",
            "신천동": "1171010200",
            "풍납동": "1171010300",
            "송파동": "1171010400",
            "석촌동": "1171010500",
            "삼전동": "1171010600",
            "가락동": "1171010700",
            "문정동": "1171010800",
            "장지동": "1171010900",
            "방이동": "1171011100",
            "오금동": "1171011200",
            "거여동": "1171011300",
            "마천동": "1171011400",
        },
        "url_template": common_template,
    },
    "양천구": {
        "regions": {
            "신정동": "1147010100",
            "목동": "1147010200",
            "신월동": "1147010300",
        },
        "url_template": common_template,
    },
    "영등포구": {
        "regions": {
            "영등포동": "1156010100",
            "영등포동1가": "1156010200",
            "영등포동2가": "1156010300",
            "영등포동3가": "1156010400",
            "영등포동4가": "1156010500",
            "영등포동5가": "1156010600",
            "영등포동6가": "1156010700",
            "영등포동7가": "1156010800",
            "영등포동8가": "1156010900",
            "여의도동": "1156011000",
            "당산동1가": "1156011100",
            "당산동2가": "1156011200",
            "당산동3가": "1156011300",
            "당산동4가": "1156011400",
            "당산동5가": "1156011500",
            "당산동6가": "1156011600",
            "당산동": "1156011700",
            "도림동": "1156011800",
            "문래동1가": "1156011900",
            "문래동2가": "1156012000",
            "문래동3가": "1156012100",
            "문래동4가": "1156012200",
            "문래동5가": "1156012300",
            "문래동6가": "1156012400",
            "양평동1가": "1156012500",
            "양평동2가": "1156012600",
            "양평동3가": "1156012700",
            "양평동4가": "1156012800",
            "양평동5가": "1156012900",
            "양평동6가": "1156013000",
            "양화동": "1156013100",
            "신길동": "1156013200",
            "대림동": "1156013300",
            "양평동": "1156013400",
        },
        "url_template": common_template,
    },
    "용산구": {
        "regions": {
            "후암동": "1117010100",
            "용산동2가": "1117010200",
            "용산동4가": "1117010300",
            "갈월동": "1117010400",
            "남영동": "1117010500",
            "용산동1가": "1117010600",
            "동자동": "1117010700",
            "서계동": "1117010800",
            "청파동1가": "1117010900",
            "청파동2가": "1117011000",
            "청파동3가": "1117011100",
            "원효로1가": "1117011200",
            "원효로2가": "1117011300",
            "신창동": "1117011400",
            "산천동": "1117011500",
            "청암동": "1117011600",
            "원효로3가": "1117011700",
            "원효로4가": "1117011800",
            "효창동": "1117011900",
            "도원동": "1117012000",
            "용문동": "1117012100",
            "문배동": "1117012200",
            "신계동": "1117012300",
            "한강로1가": "1117012400",
            "한강로2가": "1117012500",
            "용산동3가": "1117012600",
            "용산동5가": "1117012700",
            "한강로3가": "1117012800",
            "이촌동": "1117012900",
            "이태원동": "1117013000",
            "한남동": "1117013100",
            "동빙고동": "1117013200",
            "서빙고동": "1117013300",
            "주성동": "1117013400",
            "용산동6가": "1117013500",
            "보광동": "1117013600",
        },
        "url_template": common_template,
    },
    "은평구": {
        "regions": {
            "수색동": "1138010100",
            "녹번동": "1138010200",
            "불광동": "1138010300",
            "갈현동": "1138010400",
            "구산동": "1138010500",
            "대조동": "1138010600",
            "응암동": "1138010700",
            "역촌동": "1138010800",
            "신사동": "1138010900",
            "증산동": "1138011000",
            "진관동": "1138011400",
        },
        "url_template": common_template,
    },
    "종로구": {
        "regions": {
            "청운동": "1111010100",
            "신교동": "1111010200",
            "궁정동": "1111010300",
            "효자동": "1111010400",
            "창성동": "1111010500",
            "통의동": "1111010600",
            "적선동": "1111010700",
            "통인동": "1111010800",
            "누상동": "1111010900",
            "누하동": "1111011000",
            "옥인동": "1111011100",
            "체부동": "1111011200",
            "필운동": "1111011300",
            "내자동": "1111011400",
            "사직동": "1111011500",
            "도렴동": "1111011600",
            "당주동": "1111011700",
            "내수동": "1111011800",
            "세종로": "1111011900",
            "신문로1가": "1111012000",
            "신문로2가": "1111012100",
            "청진동": "1111012200",
            "서린동": "1111012300",
            "수송동": "1111012400",
            "중학동": "1111012500",
            "종로1가": "1111012600",
            "공평동": "1111012700",
            "관훈동": "1111012800",
            "견지동": "1111012900",
            "와룡동": "1111013000",
            "권농동": "1111013100",
            "운니동": "1111013200",
            "익선동": "1111013300",
            "경운동": "1111013400",
            "관철동": "1111013500",
            "인사동": "1111013600",
            "낙원동": "1111013700",
            "종로2가": "1111013800",
            "팔판동": "1111013900",
            "삼청동": "1111014000",
            "안국동": "1111014100",
            "소격동": "1111014200",
            "화동": "1111014300",
            "사간동": "1111014400",
            "송현동": "1111014500",
            "가회동": "1111014600",
            "재동": "1111014700",
            "계동": "1111014800",
            "원서동": "1111014900",
            "훈정동": "1111015000",
            "묘동": "1111015100",
            "봉익동": "1111015200",
            "돈의동": "1111015300",
            "장사동": "1111015400",
            "관수동": "1111015500",
            "종로3가": "1111015600",
            "인의동": "1111015700",
            "예지동": "1111015800",
            "원남동": "1111015900",
            "연지동": "1111016000",
            "종로4가": "1111016100",
            "효제동": "1111016200",
            "종로5가": "1111016300",
            "종로6가": "1111016400",
            "이화동": "1111016500",
            "연건동": "1111016600",
            "충신동": "1111016700",
            "동숭동": "1111016800",
            "혜화동": "1111016900",
            "명륜1가": "1111017000",
            "명륜2가": "1111017100",
            "명륜4가": "1111017200",
            "명륜3가": "1111017300",
            "창신동": "1111017400",
            "숭인동": "1111017500",
            "교남동": "1111017600",
            "평동": "1111017700",
            "송월동": "1111017800",
            "홍파동": "1111017900",
            "교북동": "1111018000",
            "행촌동": "1111018100",
            "구기동": "1111018200",
            "평창동": "1111018300",
            "부암동": "1111018400",
            "홍지동": "1111018500",
            "신영동": "1111018600",
            "무악동": "1111018700"
        },
        "url_template": common_template,
    },
    "중구": {
        "regions": {
            "무교동": "1114010100",
            "다동": "1114010200",
            "태평로1가": "1114010300",
            "을지로1가": "1114010400",
            "을지로2가": "1114010500",
            "남대문로1가": "1114010600",
            "삼각동": "1114010700",
            "수하동": "1114010800",
            "장교동": "1114010900",
            "수표동": "1114011000",
            "소공동": "1114011100",
            "남창동": "1114011200",
            "북창동": "1114011300",
            "태평로2가": "1114011400",
            "남대문로2가": "1114011500",
            "남대문로3가": "1114011600",
            "남대문로4가": "1114011700",
            "남대문로5가": "1114011800",
            "봉래동1가": "1114011900",
            "봉래동2가": "1114012000",
            "회현동1가": "1114012100",
            "회현동2가": "1114012200",
            "회현동3가": "1114012300",
            "충무로1가": "1114012400",
            "충무로2가": "1114012500",
            "명동1가": "1114012600",
            "명동2가": "1114012700",
            "남산동1가": "1114012800",
            "남산동2가": "1114012900",
            "남산동3가": "1114013000",
            "저동1가": "1114013100",
            "충무로4가": "1114013200",
            "충무로5가": "1114013300",
            "인현동2가": "1114013400",
            "예관동": "1114013500",
            "묵정동": "1114013600",
            "필동1가": "1114013700",
            "필동2가": "1114013800",
            "필동3가": "1114013900",
            "남학동": "1114014000",
            "주자동": "1114014100",
            "예장동": "1114014200",
            "장충동1가": "1114014300",
            "장충동2가": "1114014400",
            "광희동1가": "1114014500",
            "광희동2가": "1114014600",
            "쌍림동": "1114014700",
            "을지로6가": "1114014800",
            "을지로7가": "1114014900",
            "을지로4가": "1114015000",
            "을지로5가": "1114015100",
            "주교동": "1114015200",
            "방산동": "1114015300",
            "오장동": "1114015400",
            "을지로3가": "1114015500",
            "입정동": "1114015600",
            "산림동": "1114015700",
            "충무로3가": "1114015800",
            "초동": "1114015900",
            "인현동1가": "1114016000",
            "저동2가": "1114016100",
            "신당동": "1114016200",
            "흥인동": "1114016300",
            "무학동": "1114016400",
            "황학동": "1114016500",
            "서소문동": "1114016600",
            "정동": "1114016700",
            "순화동": "1114016800",
            "의주로1가": "1114016900",
            "충정로1가": "1114017000",
            "중림동": "1114017100",
            "의주로2가": "1114017200",
            "만리동1가": "1114017300",
            "만리동2가": "1114017400",
        },
        "url_template": common_template,
    },
    "중랑구": {
        "regions": {
            "면목동": "1126010100",
            "상봉동": "1126010200",
            "중화동": "1126010300",
            "묵동": "1126010400",
            "망우동": "1126010500",
            "신내동": "1126010600",
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
    # sheet 변수에 엑셀 시트 이름(구 이름)이 들어있습니다
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
                else:
                    document["tagList"] = []
            except Exception:
                document["tagList"] = []

        # ✅ location (GeoJSON) 추가
        lon, lat = document.get("longitude"), document.get("latitude")
        if lon and lat:
            document["location"] = {
                "type": "Point",
                "coordinates": [lon, lat]
            }

        # ✅ gu 필드 추가 (시트 이름을 구 이름으로)
        document["gu"] = sheet

        # ✅ realEstateTypeName 에 따라 OneRoom / TwoRoom 분기 저장
        if document.get("realEstateTypeName") in ("원룸", "오피스텔"):
            one_room_collection.insert_one(document)
        else:
            two_room_collection.insert_one(document)

print("엑셀 데이터를 MongoDB에 조건에 따라 OneRoom, TwoRoom으로 분리 저장했습니다.")
