---
name: api-development
description: OpenAPI 명세 작성, controller/service/repository 구현, 검증·권한, 오류 응답, MyBatis/Flyway 통합, 백엔드 테스트 등 API 구현 단계를 다룹니다 (detail-design은 설계 단계용).
---

# API 개발

백엔드 API를 구현할 때 이 스킬을 사용합니다. 사내 표준은 `standards/backend/backend-quality.md`를 단일 출처로 따릅니다.

## 입력 산출물

- `api-contract-handoff.md` (application-architecture가 작성한 API 계약 요구사항 — Backend 확인 항목 7개 포함)
- application-data-contract (도메인 엔티티·상태·권한·이력·보존)
- DB 설계서 / ERD
- 보안/인증 정책
- 기존 Spring Boot 코드베이스 구조

## 산출물

- OpenAPI 명세 (`docs/openapi.yaml`)
- 백엔드 구현: controller / service / repository / DTO
- MyBatis 매퍼 + 매퍼 XML
- Flyway 마이그레이션 파일
- 백엔드 테스트 (Testcontainers 기반 단위·통합)
- frontend agent 인수인계 메모 (OpenAPI 위치 외 9개 항목)
- release agent 인수인계 메모 (환경변수 + 마이그레이션 실행 순서)

## 사내 컨벤션 적용

자세한 내용은 `standards/backend/backend-quality.md`를 참조합니다. 아래 목록은 작업 시 자주 참조하는 핵심 룰의 요약이며, `backend-quality.md`가 정의적 단일 출처입니다.

- 응답 포맷: 성공 `{ "success": true, "data": {...} }`, 오류 `{ "success": false, "message": "..." }`.
- HTTP 상태코드: 200 / 400 / 401 / 403 / 404 / 500.
- MyBatis: `Map<String, Object>` 금지, 엔티티 클래스 사용, mapper XML은 `resources/mapper/`.
- Flyway: 마이그레이션 파일은 `resources/db/migration/V<n>__<desc>.sql`.
- 테스트: Testcontainers로 운영 DB와 동일 환경 (H2 금지).
- 로그: Slf4j `[HTTP /경로]`, `[메서드명]` 패턴 + catch 스택트레이스.
- 시크릿 환경변수 필수: 기본값 하드코딩 금지.
- 예외: RuntimeException 기반 커스텀 예외, `Optional` 사용.
- 포맷팅: 들여쓰기 스페이스 4칸, 줄 길이 120자, K&R 중괄호.
- Import: 모든 Java 클래스에서 와일드카드 금지, 미사용 제거.
- 주석: Why 주석만 작성.

## 작업 절차

1. `api-contract-handoff.md`에서 Backend 확인 항목 7개를 검토합니다.

2. 미정 사항(login/refresh/logout endpoint, 401/403 의미 구분, CORS Authorization 허용)은 application-architecture에게 질문으로 돌리거나 오픈 이슈로 기록합니다 — 임의 확정 금지.

3. 기존 코드베이스 분석을 수행합니다 (Spring Boot 레이어 패턴, MyBatis/Flyway 적용 여부, 테스트 도구, 환경변수 구조). 신규 프로젝트면 보일러플레이트를 사용자에게 확인합니다. 결과는 `docs/backend-project-profile.md` 또는 작업 메모로 기록합니다.

4. OpenAPI 명세를 contract-first로 작성합니다 (`docs/openapi.yaml`).

5. controller·service·repository·DTO·mapper 클래스 명명 규칙을 적용합니다 (`~Controller`, `~Service`, `~Repository`, `~Request`, `~Response`, `~Mapper`).

6. `@Valid` + 커스텀 검증 + 권한(`@PreAuthorize` 등)을 추가합니다.

7. 응답 포맷을 통일합니다 (성공: `{ "success": true, "data": {...} }`, 실패: `{ "success": false, "message": "..." }`).

8. 오류 처리: 커스텀 RuntimeException + `@RestControllerAdvice` 핸들러를 작성합니다.

9. MyBatis 매퍼를 작성합니다 — `Map<String, Object>` 금지, 엔티티/DTO 클래스 명시. mapper XML은 `resources/mapper/`.

10. DB 마이그레이션을 작성합니다 — Flyway `resources/db/migration/V<n>__<desc>.sql`.

11. 테스트를 추가합니다 — Testcontainers로 운영 DB와 동일 환경. 단위 테스트는 mocking, 통합 테스트는 실 DB.

12. 품질 게이트 — `./gradlew build`, `./gradlew test`, lint를 실행합니다.

## 검증

- `./gradlew build`로 컴파일·정적 검사·테스트를 일괄 검증합니다.
- `./gradlew test`로 단위·통합 테스트를 분리 실행합니다.
- 응답 포맷 일관성은 수동 curl 또는 Postman으로 확인합니다 (자동화는 후속 스크립트 신설 시 추가).
- 로그 패턴 적용 여부와 포맷팅·import 규칙 준수를 코드 리뷰 시 함께 점검합니다.
- Docker가 설치되지 않은 환경에서 Testcontainers가 실패하면 `dev-environment` 스킬을 참조하거나 환경 이슈로 기록합니다 (테스트 실패로 처리하지 않음).

## 인수인계

**frontend agent로** OpenAPI 위치, base URL, 인증 방식, request/response schema, 공통 오류 포맷, login/refresh/logout endpoint, 401/403 처리, CORS Authorization 허용, endpoint 기능 매핑표 + 권한별 endpoint 접근 조건 (총 9개 항목 — application-architecture-agent.md "Frontend App Front Track 인수 조건"과 1:1 대응).

**application-architecture agent로** 정합성 확인 결과·발견된 미정 정책·추가로 필요한 endpoint·schema 모순.

**release agent로** 환경변수 목록(신규/삭제/기본값 변경) + Flyway 마이그레이션 실행 순서(마이그레이션 ID, 의존성, 롤백 가능 여부).

## 완료 기준

작업 완료 판단 시 backend-agent.md "완료 기준" 섹션의 10개 기준을 사용합니다.

- OpenAPI 명세 유효

- 응답 포맷 일관

- 401/403 구분

- Flyway 마이그레이션 성공

- 백엔드 테스트 통과 (`./gradlew test`)

- 로그 규칙 준수

- 시크릿 환경변수 분리

- frontend 인수인계 메모 작성 (9개 항목)

- release 인수인계 메모 작성

- application-architecture 정합성 확인 결과 보고
