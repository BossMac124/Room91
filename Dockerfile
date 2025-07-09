FROM openjdk:17
WORKDIR /app

# Spring Boot JAR 복사
COPY BuDongSan/build/libs/BuDongSan-0.0.1-SNAPSHOT.jar /housing.jar

# frontend 정적 파일 복사
COPY static /app/static

ENTRYPOINT ["java", "-jar", "/housing.jar"]