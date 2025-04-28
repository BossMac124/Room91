import psycopg2
import requests
import xml.etree.ElementTree as ET
from requests.adapters import HTTPAdapter
import ssl
from datetime import datetime, timedelta

# 서울 재개발 지역 API 키
API_KEY = "794b46457766676836364c49634b54"
REAL_TRANSACTION_KEY = "c9SfMeQ61ARlLbsN9lIWjaUmHDXw4UN0Xu2BjXhyqN0xHJM/oNEQBh5zXiEZwmPrQ8GXCdy9xI2shXZxRljO/A=="

# PostgreSQL 연결 정보
conn = psycopg2.connect(
    dbname="postgres",
    user="budongsan",
    password="4223",
    host="localhost",  # 또는 "127.0.0.1"
    port="5432"
)
cursor = conn.cursor()

# 실행 전 기존 데이터 모두 삭제
cursor.execute("DELETE FROM real_estate_deals")
conn.commit()
print("기존 데이터 삭제 완료 ✅")

# 날짜 계산 로직
today = datetime.now()

# 이전 달 계산 (1월이면 작년 12월로 변경)
if today.month == 1:
    prev_month = 12
    prev_year = today.year - 1
else:
    prev_month = today.month - 1
    prev_year = today.year


# 중복되지 않는 동을 저장할 리스트
unique_neighborhoods = []
unique_law_dong_codes = []
deal_day = f"{prev_year}{prev_month:02d}"

count = 0

class TLSAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = ssl.create_default_context()
        # OpenSSL의 보안 수준을 낮춤 (SECLEVEL=1)
        context.set_ciphers('DEFAULT@SECLEVEL=1')
        kwargs['ssl_context'] = context
        return super().init_poolmanager(*args, **kwargs)

# 재개발 지역 api
def get_redevelopment_info(district, neighborhood=None):
    """주어진 구(district)와 동(neighborhood)에 대한 재개발 정보 가져오기"""

    # 한 번에 가져올 데이터 수 (최대 100개)
    page_start = 1
    page_end = 100

    all_business_info = []  # 모든 데이터를 저장할 리스트

    # neighborhood 값이 없으면 해당 구의 모든 재개발 정보를 가져옴
    if neighborhood:
        url = f"http://openapi.seoul.go.kr:8088/{API_KEY}/xml/CleanupBussinessInfo/{page_start}/{page_end}/{district}/{neighborhood}"
    else:
        url = f"http://openapi.seoul.go.kr:8088/{API_KEY}/xml/CleanupBussinessInfo/{page_start}/{page_end}/{district}"

    response = requests.get(url)

    if response.status_code == 200:
        # XML 파싱
        root = ET.fromstring(response.text)
        business_info = []

        # XML에서 row 태그를 순차적으로 처리
        for row in root.iter('row'):
            business_data = {}

            # 기본적인 정보 추출
            business_data['district'] = district
            business_data['neighborhood'] = neighborhood if neighborhood else row.find('STDG_NM').text or "정보 없음"
            business_data['law_dong_code'] = row.find('BIZ_NO').text if row.find('BIZ_NO') is not None else None
            business_data['business_name'] = row.find('ASCT_NM').text if row.find('ASCT_NM') is not None else None

            # 추가된 항목들
            business_data['business_type'] = row.find('BIZ_SE').text if row.find('BIZ_SE') is not None else None
            business_data['approval_status'] = row.find('PRGRS_SEQ').text if row.find('PRGRS_SEQ') is not None else None
            business_data['construction_name'] = row.find('OPER_SE').text if row.find('OPER_SE') is not None else None

            if business_data['business_type'] == "재개발(주택정비형)":
                business_info.append(business_data)

        all_business_info.extend(business_info)

    else:
        print("API 요청 실패:", response.status_code)

    return all_business_info

# 단독 다가구 매매 실거래가 api
def get_real_single_family_home_deals(law_code, deal_ymd, api_key):
    """실거래 데이터를 가져오는 함수"""
    url = "http://apis.data.go.kr/1613000/RTMSDataSvcSHTrade/getRTMSDataSvcSHTrade"

    page_size = 100
    page_start = 1
    all_deals = []
    seen_deals = set()  # 중복 거래를 추적할 set

    while True:
        params = {
            "LAWD_CD": law_code,
            "DEAL_YMD": deal_ymd,
            "serviceKey": api_key,
            "pageNo": page_start,
            "numOfRows": page_size,
            "type": "xml"
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            try:
                root = ET.fromstring(response.text)
                items = root.findall('.//item')

                if not items:  # 더 이상 데이터가 없으면 종료
                    break

                for item in items:
                    # 거래 데이터를 추출
                    deal_data = {
                        'deal_year': item.findtext('dealYear'),
                        'deal_month': item.findtext('dealMonth'),
                        'umdNm': item.findtext('umdNm'),
                        'deal_day': item.findtext('dealDay'),
                        'deal_amount': item.findtext('dealAmount'),
                        'house_type': item.findtext('houseType'),
                        'jibun': item.findtext('jibun'),
                        'plottage_area': item.findtext('plottageAr')
                    }

                    # 거래의 고유성을 결정할 식별자 (중복 판단 기준)
                    deal_identifier = (deal_data['deal_year'], deal_data['deal_month'], deal_data['deal_day'], deal_data['umdNm'], deal_data['jibun'])

                    # 중복된 거래인지 확인
                    if deal_identifier not in seen_deals:
                        all_deals.append(deal_data)  # 중복이 아니면 리스트에 추가
                        seen_deals.add(deal_identifier)  # 중복 처리된 거래로 등록

                print(f"단독 다가구 페이지 {page_start} 처리 완료, 현재까지 {len(all_deals)}개 데이터 수집됨")
                page_start += 1  # 다음 페이지 요청

            except ET.ParseError:
                print("XML 파싱 에러 발생")
                print(response.text)  # 응답 내용 출력
                return []
        else:
            print(f"API 요청 실패: {response.status_code}")
            print(response.text)  # 응답 내용 출력
            break

    return all_deals

# 아파트 매매 실거래가 api
def get_apt_deals(law_code, deal_ymd, api_key):
    """아파트 실거래 데이터를 가져오는 함수"""
    url = "http://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade"

    page_size = 100
    page_start = 1
    all_deals = []

    while True:
        params = {
            "LAWD_CD": law_code,
            "DEAL_YMD": deal_ymd,
            "serviceKey": api_key,
            "pageNo": page_start,
            "numOfRows": page_size,
            "type": "xml"
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            try:
                root = ET.fromstring(response.text)
                items = root.findall('.//item')

                if not items:  # 더 이상 데이터가 없으면 종료
                    break

                for item in items:
                    deal_data = {
                        'deal_year': item.findtext('dealYear'),
                        'deal_month': item.findtext('dealMonth'),
                        'deal_day': item.findtext('dealDay'),
                        'umdNm': item.findtext('umdNm'),
                        'apt_name': item.findtext('aptNm'),
                        'deal_amount': item.findtext('dealAmount'),
                        'jibun': item.findtext('jibun'),
                        'floor': item.findtext('floor'),
                        'exclu_use_ar': item.findtext('excluUseAr')
                    }
                    all_deals.append(deal_data)

                print(f"아파트 페이지 {page_start} 처리 완료, 현재까지 {len(all_deals)}개 데이터 수집됨")
                page_start += 1  # 다음 페이지 요청

            except ET.ParseError:
                print("XML 파싱 에러 발생")
                print(response.text)  # 응답 내용 출력
                return []
        else:
            print(f"API 요청 실패: {response.status_code}")
            print(response.text)  # 응답 내용 출력
            break

    return all_deals

# 연립 다세대 매매 실거래 api
def get_villa_deals(law_code, deal_ymd, api_key):
    """연립 다세대 실거래 데이터를 가져오는 함수 (XML 응답)"""
    url = "https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade"

    page_size = 100
    page_start = 1
    all_deals = []
    seen_deals = set()  # 중복 거래를 추적할 set

    session = requests.Session()
    session.mount("https://", TLSAdapter())

    while True:
        params = {
            "LAWD_CD": law_code,  # 예: 11680
            "DEAL_YMD": deal_ymd,  # 예: 202503
            "serviceKey": api_key,
            "pageNo": page_start,
            "numOfRows": page_size,
            "type": "xml"  # XML 형식으로 요청
        }

        try:
            response = session.get(url, params=params, timeout=30)
        except requests.exceptions.RequestException as e:
            print(f"요청 중 오류 발생: {e}")
            break

        if response.status_code == 200:
            try:
                root = ET.fromstring(response.text)
                items = root.findall('.//item')

                if not items:  # 더 이상 데이터가 없으면 종료
                    break

                for item in items:
                    # 거래 데이터를 추출
                    deal_data = {
                        'deal_year': item.findtext('dealYear'),
                        'deal_month': item.findtext('dealMonth'),
                        'deal_day': item.findtext('dealDay'),
                        'umdNm': item.findtext('umdNm'),
                        'house_type': item.findtext('houseType'),
                        'deal_amount': item.findtext('dealAmount'),
                        'jibun': item.findtext('jibun'),
                        'floor': item.findtext('floor'),
                        'exclu_use_ar': item.findtext('excluUseAr')
                    }

                    # 거래의 고유성을 결정할 식별자 (중복 판단 기준)
                    deal_identifier = (deal_data['deal_year'], deal_data['deal_month'], deal_data['deal_day'], deal_data['umdNm'], deal_data['jibun'])

                    # 중복된 거래인지 확인
                    if deal_identifier not in seen_deals:
                        all_deals.append(deal_data)  # 중복이 아니면 리스트에 추가
                        seen_deals.add(deal_identifier)  # 중복 처리된 거래로 등록

                print(f"연립 다세대 페이지 {page_start} 처리 완료, 현재까지 {len(all_deals)}개 데이터 수집됨")
                page_start += 1  # 다음 페이지 요청

            except ET.ParseError as e:
                print(f"XML 파싱 오류: {e}")
                print(response.text)
                break
        else:
            print(f"API 요청 실패: {response.status_code}")
            print(response.text)
            break

    return all_deals

# 토지 매매 실거래 api
def get_land_sale_deals(law_code, deal_ymd, api_key):

    url = "https://apis.data.go.kr/1613000/RTMSDataSvcLandTrade/getRTMSDataSvcLandTrade"

    page_size = 100
    page_start = 1
    all_deals = []

    session = requests.Session()
    session.mount("https://", TLSAdapter())

    while True:
        params = {
            "LAWD_CD": law_code,
            "DEAL_YMD": deal_ymd,
            "serviceKey": api_key,
            "pageNo": page_start,
            "numOfRows": page_size,
            "type": "xml"  # XML 형식으로 요청
        }

        try:
            response = session.get(url, params=params, timeout=30)
        except requests.exceptions.RequestException as e:
            print(f"요청 중 오류 발생: {e}")
            break

        if response.status_code == 200:
            try:
                root = ET.fromstring(response.text)
                items = root.findall('.//item')

                if not items:  # 더 이상 데이터가 없으면 종료
                    break

                for item in items:
                    deal_data = {
                        'deal_year': item.findtext('dealYear'),
                        'deal_month': item.findtext('dealMonth'),
                        'deal_day': item.findtext('dealDay'),
                        'umdNm': item.findtext('umdNm'),
                        'jibun': item.findtext('jibun'),
                        'deal_amount': item.findtext('dealAmount'),
                        'deal_area': item.findtext('dealArea'),
                        'jimok': item.findtext('jimok'),
                        'land_use': item.findtext('landUse'),
                        'share_dealing_type': item.findtext('shareDealingType'),
                        'dealing_gbn': item.findtext('dealingGbn'),
                    }
                    all_deals.append(deal_data)

                print(f"토지 매매 페이지 {page_start} 처리 완료, 현재까지 {len(all_deals)}개 데이터 수집됨")
                page_start += 1
            except ValueError as e:
                print(f"XML 파싱 오류: {e}")
                print(response.text)
                break
        else:
            print(f"API 요청 실패: {response.status_code}")
            print(response.text)
            break

    return all_deals

# 중복되지 않는 동 리스트와 매매 실거래가 필터
def filter_real_deals(real_estate_deals, unique_neighborhoods):
    """umdNm 값이 unique_neighborhoods에 포함된 데이터만 필터링"""
    return [deal for deal in real_estate_deals if deal.get('umdNm') in unique_neighborhoods]

# 공통 INSERT 함수
def insert_real_estate_data(cursor, conn, deal_list, data_type):
    for item in deal_list:
        # 거래금액에서 콤마 제거 후 long 타입으로 변환
        deal_amount = item.get('deal_amount').replace(',', '')  # 콤마 제거
        deal_amount = int(deal_amount)  # 숫자로 변환

        cursor.execute("""
            INSERT INTO real_estate_deals (
                deal_year, deal_month, deal_day, district, neighborhood,
                deal_amount, house_type, apt_name, jibun, floor,
                exclu_use_ar, plottage_area, deal_area, jimok,
                land_use, share_dealing_type, dealing_gbn, data_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                      %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            item.get('deal_year'),
            item.get('deal_month'),
            item.get('deal_day'),
            item.get('district'),
            item.get('umdNm'),
            deal_amount,  # 변환된 거래금액을 전달
            item.get('house_type'),
            item.get('apt_name'),
            item.get('jibun'),
            item.get('floor'),
            item.get('exclu_use_ar'),
            item.get('plottage_area'),
            item.get('deal_area'),
            item.get('jimok'),
            item.get('land_use'),
            item.get('share_dealing_type'),
            item.get('dealing_gbn'),
            data_type
        ))

    conn.commit()



# 서울특별시 모든 구 리스트
seoul_gu_list = [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
    "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
    "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
]
for seoul in seoul_gu_list:
    redevelopment_info = get_redevelopment_info(seoul)

    filtered_single_deals = []
    filtered_apt_deals = []
    filtered_multi_generational_deals = []
    filtered_land_sale_deals = []
    unique_law_dong_codes = []
    unique_neighborhoods = []

    # 결과 출력
    for item in redevelopment_info:
        print(item)

    # redevelopment_info에서 동을 하나씩 확인하여 중복되지 않으면 unique_neighborhoods 리스트에 추가
    for item in redevelopment_info:
        neighborhood = item['neighborhood']
        if neighborhood not in unique_neighborhoods:
            unique_neighborhoods.append(neighborhood)

    # 법정동코드를 하나씩 확인하여 중복되지 않으면 unique_law_dong_codes 리스트에 추가
    for item in redevelopment_info:
        law_dong_code = item['law_dong_code']

        if law_dong_code and law_dong_code != '':  # law_dong_code가 None이나 빈 문자열이 아닌 경우
            # 앞자리 5자리만 추출
            law_dong_code_prefix = law_dong_code[:5]

            # 숫자형으로 변환하여 중복되지 않으면 unique_law_dong_codes에 추가
            if int(law_dong_code_prefix) not in unique_law_dong_codes:
                unique_law_dong_codes.append(int(law_dong_code_prefix))  # int로 변환하여 추가


    # 중복되지 않는 동 리스트 출력
    # print(unique_neighborhoods)

    # 해당 구의 법정동 코드
    # print(unique_law_dong_codes)

    # 단독 다가구 api를 이용한 재개발 정보
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        real_single_family_deals = get_real_single_family_home_deals(unique_law_dong_codes[0], deal_day, REAL_TRANSACTION_KEY)


    # 아파트 api를 이용한 재개발 정보
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        real_apt_deals = get_apt_deals(unique_law_dong_codes[0], deal_day, REAL_TRANSACTION_KEY)

    # 연립 다세대 api를 이용한 재개발 정보
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        real_multi_generational_deals = get_villa_deals(unique_law_dong_codes[0], deal_day, REAL_TRANSACTION_KEY)

    # 토지 매매 api이용한 재개발 정보
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        real_land_sale_deals = get_land_sale_deals(unique_law_dong_codes[0], deal_day, REAL_TRANSACTION_KEY)

    # 출력 테스트
    # print(real_apt_deals)

    # 필터링 실행 (단독 다가구)
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        filtered_single_deals = filter_real_deals(real_single_family_deals, unique_neighborhoods)

    # 필터링 실행 (아파트)
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        filtered_apt_deals = filter_real_deals(real_apt_deals, unique_neighborhoods)

    # 필터링 실행 (연립 다세대)
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        filtered_multi_generational_deals = filter_real_deals(real_multi_generational_deals, unique_neighborhoods)

    # 필터링 실행 (토지 매매)
    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:
        filtered_land_sale_deals = filter_real_deals(real_land_sale_deals, unique_neighborhoods)

    if not unique_law_dong_codes or unique_law_dong_codes[0] is None:
        print("해당 데이터가 없습니다.")

    if unique_law_dong_codes and unique_law_dong_codes[0] is not None:

        # 단독 다가구 리스트 출력
        for item in filtered_single_deals:
            count +=1
            item["district"] = f"{seoul}"
            print(item)

        # 아파트 리스트 출력
        for item in filtered_apt_deals:
            count +=1
            item["district"] = f"{seoul}"
            print(item)

        # 연립 다세대 리스트 출력
        for item in filtered_multi_generational_deals:
            count +=1
            item["district"] = f"{seoul}"
            print(item)

        # 토지 매매 리스트 출력
        for item in filtered_land_sale_deals:
            count +=1
            item["district"] = f"{seoul}"
            print(item)

        insert_real_estate_data(cursor, conn, filtered_single_deals, "단독")
        insert_real_estate_data(cursor, conn, filtered_apt_deals, "아파트")
        insert_real_estate_data(cursor, conn, filtered_multi_generational_deals, "연립")
        insert_real_estate_data(cursor, conn, filtered_land_sale_deals, "토지")
cursor.close()
conn.close()
print(f"조회된 서울시 재개발 총 데이터 갯수: {count}개" )
