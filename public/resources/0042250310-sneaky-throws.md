---
title: "Lombok 의 @SneakyThrows"
author: "nimkoes"
date: "2025-03-09"
tags: [ "study", "nuggets", "lombok", "annotation", "SneakyThrows" ]
---

## @SneakyThrows 소개

- `@SneakyThrows` 는 `Lombok` 라이브러리에서 제공하는 `annotation` 이다.
- 메서드에서 발생하는 예외를 명시적인 `try-catch` 없이 처리할 수 있게 해주는 기능을 제공 한다.

## @SneakyThrows 사용 목적

1. 코드의 가독성을 향상시킨다.
2. 불필요한 `try-catch` 블록을 제거한다.
3. `checked exception` 을 `runtime exception` 처럼 처리할 수 있다.

## 실제 사용 예시와 실행 결과

### 파일 읽기 예제

```java
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
public class FileReader {
  // IOException 을 throws 선언 없이 처리 한다
  @SneakyThrows
  public String readFile(String path) {
    log.info("파일 읽기 시작: {}", path);
    String content = Files.readString(Path.of(path));
    log.info("파일 읽기 완료: {}", path);
    return content;
  }
}
```

### 데이터베이스 연결 예제

```java
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.sql.Connection;
import java.sql.DriverManager;

@Slf4j
public class DatabaseService {
  @SneakyThrows
  public Connection connectToDatabase(String url) {
    log.info("데이터베이스 연결 시도: {}", url);
    Connection connection = DriverManager.getConnection(url);
    log.info("데이터베이스 연결 성공: {}", url);
    return connection;
  }
}
```

### 실행 결과 예시

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Main {
  public static void main(String[] args) {
    FileReader reader = new FileReader();
    DatabaseService dbService = new DatabaseService();

    // 1. 파일 읽기 성공 케이스
    try {
      String content = reader.readFile("existing.txt");
      log.info("파일 내용: {}", content);
    } catch (RuntimeException e) {
      log.error("파일 읽기 실패", e);
    }

    // 2. 파일 읽기 실패 케이스
    try {
      reader.readFile("non-existing.txt");
    } catch (RuntimeException e) {
      log.error("파일 읽기 실패: {}", e.getCause().getMessage());
    }

    // 3. DB 연결 실패 케이스
    try {
      dbService.connectToDatabase("jdbc:mysql://invalid-host/db");
    } catch (RuntimeException e) {
      log.error("데이터베이스 연결 실패: {}", e.getCause().getMessage());
    }
  }
}
```

### 실행 결과 로그

```shell
2025-03-19 23:15:30.123 INFO [main] FileReader - 파일 읽기 시작: existing.txt
2025-03-19 23:15:30.145 INFO [main] FileReader - 파일 읽기 완료: existing.txt
2025-03-19 23:15:30.146 INFO [main] Main - 파일 내용: Hello, World!
2025-03-19 23:15:30.147 INFO [main] FileReader - 파일 읽기 시작: non-existing.txt
2025-03-19 23:15:30.148 ERROR [main] Main - 파일 읽기 실패: java.nio.file.NoSuchFileException: non-existing.txt
2025-03-19 23:15:30.149 INFO [main] DatabaseService - 데이터베이스 연결 시도: jdbc:mysql://invalid-host/db
2025-03-19 23:15:31.253 ERROR [main] Main - 데이터베이스 연결 실패: Communications link failure
```

## @SneakyThrows 속성 상세

- `@SneakyThrows` 은 다음과 같은 속성을 가진다:

```java

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.SOURCE)
public @interface SneakyThrows {
  Class<? extends Throwable>[] value() default Throwable.class;
}
```

### 속성 설명

- `value()`
  - 기본값: `Throwable.class`
  - 처리하고자 하는 예외 클래스들을 지정한다.
  - 배열 형태로 여러 예외를 지정할 수 있다.

### 사용 예시

```java
import lombok.SneakyThrows;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.DriverManager;
import java.nio.file.Files;
import java.nio.file.Path;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ExceptionExample {
  // 모든 예외를 처리 (기본값 사용)
  @SneakyThrows
  public void handleAllExceptions() {
    // 어떤 예외든 처리된다
    throw new Exception("일반 예외");
  }

  // 특정 예외만 처리
  @SneakyThrows(IOException.class)
  public void handleIOException() {
    // IOException만 처리된다
    Files.readString(Path.of("non-existing.txt"));
  }

  // 여러 예외 처리
  @SneakyThrows({IOException.class, SQLException.class})
  public void handleMultipleExceptions(boolean isFileOperation) {
    if (isFileOperation) {
      // 파일 작업 시도
      Files.readString(Path.of("non-existing.txt"));
    } else {
      // DB 연결 시도
      DriverManager.getConnection("jdbc:mysql://invalid-host/db");
    }
  }
}
```

### 실행 결과 로그

```shell
2024-03-19 21:47:15.123 ERROR [main] ExceptionExample - 예외 발생: java.lang.Exception: 일반 예외
2024-03-19 21:47:15.124 ERROR [main] ExceptionExample - 예외 발생: java.io.IOException: non-existing.txt (No such file or directory)
2024-03-19 21:47:15.125 ERROR [main] ExceptionExample - 예외 발생: java.sql.SQLException: No suitable driver found
```

## 내부 동작 원리

`@SneakyThrows` 는 다음과 같은 코드로 변환된다

```java
// 원본 코드
@SneakyThrows
public String readFile(String path) {
  return Files.readString(Path.of(path));
}

// 변환된 코드
public String readFile(String path) {
  try {
    return Files.readString(Path.of(path));
  } catch (Throwable t) {
    throw Lombok.sneakyThrow(t);
  }
}
```

### 예외 전파 과정

1. 메서드 내에서 예외 발생
2. `Lombok.sneakyThrow()` 가 예외를 런타임 예외로 래핑
3. 호출자에게 전파
4. 로깅 시스템을 통해 예외 정보 기록

## 주의사항

1. `@SneakyThrows` 는 체크드 예외를 런타임 예외로 감싸서 던진다.
2. 실제로 예외가 사라지는 것이 아니라 컴파일러 수준에서만 체크를 우회 한다.
3. 남용하면 예외 처리가 불명확해질 수 있으므로 신중하게 사용해야 한다.
4. 지정되지 않은 예외 클래스를 처리하려고 하면 컴파일 에러가 발생한다.
5. 런타임 예외는 `@SneakyThrows` 없이도 `throws` 선언이 필요 없다.
6. 상속 관계에 있는 예외 클래스의 경우, 상위 클래스만 지정해도 하위 클래스 예외가 처리된다.
7. 테스트 코드나 예외 처리가 명확한 상황에서 사용하는 것이 좋다.

## 결론

- `@SneakyThrows`는 코드를 간결하게 만들어주는 유용한 도구이다.
- 로깅과 함께 사용하면 예외 추적과 디버깅이 용이하며, 코드의 가독성도 향상된다.
- 하지만 예외 처리의 명확성과 코드 유지보수성을 고려하여 적절한 상황에서만 사용해야 한다.
