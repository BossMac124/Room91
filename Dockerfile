# Dockerfile (backend, staging/prod 공용)
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY ./*SNAPSHOT.jar /app/app.jar

ENTRYPOINT ["java","-jar","/app/app.jar"]