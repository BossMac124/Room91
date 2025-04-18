# 📦 Room91

직장인이 매물을 찾을 때 따로 교통 앱을 열 필요 없이, 회사까지의 통합 통근 소요 시간을 자동 계산해주는 부동산 웹 서비스를 개발했습니다.
또한, 재개발 지역의 실거래가 및 투자 정보를 AI 뉴스 형태로 제공하여 투자자의 의사결정을 돕는 서비스도 포함했습니다.

## 🛠 기술 스택
- Java 17 / Spring Boot
- JavaScreipt(react ?)
- MongoDB / Redis / PostgreSQL
- Gradle

## 파일 구조도



## ⚙️ 실행 방법

1. 프로젝트 복제
2. MongoDBCompass, docker Desktop 설치
3. 프로젝트 복제후 빌드 실행
4. 터미널에서 
   'cd BuDongSan 
   docker build -t housing-image:1.0 .'
   생성된 이미지 확인
5. docker-compose.yml 파일 실행 후 docker Desktop에서 budongsan 멀티컨테이너 실행
6. Python 폴더 들어가서 터미널로 이동
   'pip install -r requirements.txt ' 명령어 실행
7. 파이썬 파일을 실행
8. MongoDBCompass에서 house 컬렉션에서  OpenMongoDB shell에 접속
   'db.house.createIndex( { location: "2dsphere" })' 명령어를 실행
9. MongoDBCompass에서 directions 컬렉션을 생성후 OpenMongoDB shell에 접속
   db.directions.createIndex( { origin: "2dsphere" })
   db.directions.createIndex( { destination: "2dsphere" }) 
   명령어 실행
10. 프로젝트로 넘어가서 BuDongSanApplication 실행
11. 주소창에 http://localhost:8080/index.html에 접속 -> 추후 변경예정
   
## 실행 결과
