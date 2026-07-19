FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build /app/target/BACKEND-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 4040
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
