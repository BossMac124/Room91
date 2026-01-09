# Dockerfile (backend, staging/prod 공용)
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY BuDongSan/build/libs/BuDongSan-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java","-jar","/app/app.jar"]