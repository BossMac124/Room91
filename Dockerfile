FROM openjdk:17
WORKDIR /app
COPY BuDongSan/build/libs/BuDongSan-0.0.1-SNAPSHOT.jar /housing.jar
ENTRYPOINT ["java", "-jar", "/housing.jar"]