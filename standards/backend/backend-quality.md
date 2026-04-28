# Backend 품질 표준

이 문서는 글로벌 `~/.claude/CLAUDE.md`의 백엔드 영역을 backend agent가 작업 시점별로 참조할 수 있도록 재구성한 단일 출처 체크리스트입니다. 글로벌 CLAUDE.md가 변경되면 본 문서도 동기화합니다.

## 코드 구조 / 네이밍

- 클래스: UpperCamelCase, 명사 (`MemberService`, `OrderRepository`).
- 메서드: lowerCamelCase, 동사 시작 (`findById()`, `createOrder()`).
- Spring 클래스: `~Controller`, `~Service`, `~Repository`, `~Request`, `~Response`, `~Mapper` 명명 규칙을 사용합니다.
- 변수: lowerCamelCase (`memberName`, `orderCount`).
- 상수: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`).
- Boolean: `is`, `has`, `can` 접두사 (`isActive`, `hasPermission`).
- 메서드 길이는 30~50줄 이내, 한 가지 일만 수행하고 early return을 활용합니다.
- 파라미터가 3개를 초과하면 DTO로 묶습니다.
- `@Transactional`을 명시하고, 읽기 전용은 `readOnly = true`를 함께 선언합니다.

## 포맷팅 / 주석 / Import

- 들여쓰기는 스페이스 4칸을 사용합니다.
- 줄 길이는 120자를 넘지 않습니다.
- 중괄호는 K&R 스타일(여는 중괄호 같은 줄), 한 줄 if문도 중괄호를 필수로 둡니다.
- 어노테이션은 한 줄에 하나씩, 선언 위에 배치합니다.
- 주석은 Why 주석만 작성합니다 (코드로 의도가 드러나면 생략). 주석 달린 코드는 커밋하지 않습니다.
- 모든 Java 클래스에서 와일드카드(`*`) import 금지, 미사용 import는 제거합니다.

## API 응답 포맷

- 성공 응답: `{ "success": true, "data": { ... } }`.
- 오류 응답: `{ "success": false, "message": "에러 메시지" }`.
- HTTP 상태코드 매핑: 200(성공), 400(잘못된 요청), 401(인증 실패 — backend 확장, 글로벌 표준은 401 미포함), 403(권한 없음), 404(리소스 없음), 500(서버 오류).

## 검증·권한

- Request DTO에 `@Valid`와 Bean Validation 어노테이션(`@NotNull`, `@Size` 등)을 적용합니다.
- 추가 검증이 필요하면 커스텀 validator를 작성합니다.
- 권한 검사는 `@PreAuthorize` 또는 동등한 메커니즘으로 endpoint 레벨에서 명시합니다.
- 권한별 endpoint 접근 조건은 OpenAPI 명세에 함께 기록합니다.

## MyBatis

- `Map<String, Object>` 대신 엔티티 클래스를 사용합니다 — 타입 안전성 확보.
- Mapper의 반환 타입과 파라미터는 엔티티 또는 DTO로 명시합니다.
- mapper XML은 `resources/mapper/` 하위에 배치합니다.

## DB 마이그레이션

- `schema.sql` 직접 관리 금지 — Flyway를 사용합니다.
- 마이그레이션 파일 경로: `resources/db/migration/V<n>__<description>.sql`.

## 테스트 환경

- H2 금지 — Testcontainers로 운영 DB와 동일한 환경에서 테스트합니다.
- DB별 문법 차이(예: `ON CONFLICT`, `INTERVAL`)로 인한 통합 테스트 회귀를 방지합니다.

## 보안

- JWT secret 등 시크릿 키에 기본값 하드코딩 금지 — 시크릿 환경변수 필수, 환경변수가 없으면 시작 시 에러.
- Refresh Token 갱신 시 이전 토큰을 명시적으로 삭제한 뒤 새 토큰을 저장합니다 (덮어쓰기 의존 금지).

## 로깅

- Slf4j를 사용합니다.
- Controller: 각 엔드포인트 진입 시 `log.info("[HTTP메서드 /경로] param={}", value)`.
- Service: 메서드 진입/완료 시 `log.info("[메서드명] key={}", value)`.
- catch 블록: `log.error("[메서드명] 실패", e)` — 스택트레이스 포함 필수.
- 중요 분기점은 `log.debug`로 어느 쪽으로 갔는지 기록합니다.

## 예외

- RuntimeException 기반 커스텀 예외를 사용합니다.
- catch 블록을 비우지 않습니다 — 최소한 로깅합니다.
- null 대신 `Optional`을 사용하고, `orElseThrow()`로 처리합니다.
- 전역 예외 처리는 `@RestControllerAdvice`에 모읍니다.

## 빌드 전달

- Gradle Wrapper(`gradlew`, `gradlew.bat`, `gradle-wrapper.jar`)를 저장소에 포함합니다 — clone 후 바로 빌드·실행 가능해야 합니다.
- `.gitattributes`로 Windows/Mac 줄바꿈을 통일합니다 (`* text=auto` + 확장자별 `eol=lf`).

## 검증 게이트

- `./gradlew build` — 컴파일·정적 검사·테스트 일괄.
- `./gradlew test` — 단위·통합 테스트 분리 실행.
- lint·정적 분석 도구가 설정돼 있으면 함께 실행합니다.
- 응답 포맷 일관성은 수동 curl 또는 Postman으로 확인합니다 (자동화는 후속 스크립트 신설 시 추가).
- 빌드와 테스트가 통과해야 산출물을 전달합니다 — 실행만 하고 실패 상태로 인수인계하지 않습니다.
