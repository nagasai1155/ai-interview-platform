# backend/Dockerfile

# Stage 1 — Build the jar
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2 — Run the jar
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# create uploads folder inside container
RUN mkdir -p uploads/resumes

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]