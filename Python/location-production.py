import pymongo
import ast

# (1) MongoDB 연결
client = pymongo.MongoClient("mongodb://root:1234@3.39.127.143:27018/housing?authSource=admin")
db = client["housing"]
collection = db["house"]

# (2) 전체 문서 순회하며 보정
for doc in collection.find():
    update_fields = {}

    # GeoJSON location 추가
    if "longitude" in doc and "latitude" in doc:
        update_fields["location"] = {
            "type": "Point",
            "coordinates": [doc["longitude"], doc["latitude"]]
        }

    # tagList 보정: 문자열이면 리스트로 변환
    tag_list = doc.get("tagList")
    if isinstance(tag_list, str):
        try:
            parsed_list = ast.literal_eval(tag_list)
            if isinstance(parsed_list, list):
                update_fields["tagList"] = parsed_list
        except Exception:
            pass  # 변환 실패하면 무시

    # 업데이트 적용
    if update_fields:
        collection.update_one({"_id": doc["_id"]}, {"$set": update_fields})

print("MongoDB 데이터 보정 완료: location 및 tagList 정리됨.")
