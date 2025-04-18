# 📦 Room91

직장인이 원하는 매물을 찾으면 별도로 대중교통 앱을 열어 출퇴근 시간을 계산해야 했습니다. 
이 불편을 해결하고자, 부동산 매물 정보를 모아 회사까지의 통합 통근 소요 시간을 자동으로 보여주는 웹 서비스 제공하고,
재개발 투자자를 위한 재개발 지역의 실거래가 정보와 매일 업데이트가 되는 정보를 모아 AI뉴스로 제공하는 부동산 웹 서비스를 제작하게 되었습니다.

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
4. 터미널에서 docker build -t housing-image:1.0 .
   생성된 이미지 확인
5. docker-compose.yml 파일 실행 후 docker Desktop에서 budongsan 멀티컨테이너 실행
6. MongoDBCompass에서 house 컬렉션에서  OpenMongoDB shell에 접속
   db.house.createIndex( { location: "2dsphere" }) 명령어를 실행
7. MongoDBCompass에서 directions 컬렉션을 생성후 OpenMongoDB shell에 접속
   db.directions.createIndex( { origin: "2dsphere" })
   db.directions.createIndex( { destination: "2dsphere" }) 
   명령어 실행
8. 프로젝트로 넘어가서 BuDongSanApplication 실행
9. 주소창에 http://localhost:8080/index.html에 접속 -> 추후 변경예정
   
