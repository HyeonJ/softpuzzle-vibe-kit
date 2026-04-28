# API Contract Handoff

Application Architecture agent가 API/Backend agent와 Frontend agent에게 넘기는 API 계약 요구사항입니다.

이 문서는 OpenAPI 자체를 대체하지 않습니다. Backend/API agent는 이 문서를 기준으로 `docs/openapi.yaml` 또는 API 명세를 작성하고, Frontend agent는 OpenAPI와 함께 이 문서를 확인합니다.

## 문서 정보

- 프로젝트:
- 도메인:
- 기준 프로그램 설계서:
- 기준 application-data-contract:
- 기준 DB 설계서:
- 작성자:
- 작성일:

## API 계약 원칙

| 항목 | 결정 | 비고 |
| --- | --- | --- |
| API 명세 원천 | `docs/openapi.yaml` (권장 기본값) / `docs/openapi.json` / 기타 | backend agent와 frontend automation이 동일 포맷 사용 |
| Base URL 정책 |  |  |
| 응답 포맷 | raw JSON / `{ success, data, message }` / 기타 |  |
| 오류 포맷 |  |  |
| 인증 방식 | bearerAuth / cookie session / none / 기타 |  |
| 401 의미 |  |  |
| 403 의미 |  |  |

## Endpoint 요구사항

| 기능 | Method | Endpoint 후보 | 인증 필요 | 요청 | 응답 | 오류 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | GET/POST/PUT/PATCH/DELETE |  | 예/아니오 |  |  |  |  |

## Request/Response Schema 요구사항

| 이름 | 구분 | 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
| --- | --- | --- | --- | --- | --- | --- |
|  | request/response/error |  |  |  | regex 또는 Bean Validation 표현 |  |

## 상태/정책 기반 API 규칙

| 정책 ID | API 영향 | 성공/실패 | Status | Frontend 처리 | 비고 |
| --- | --- | --- | --- | --- | --- |
| POL-001 |  | 성공/실패 |  |  |  |

## No-op API 처리

| 조건 | Status | 응답 | 이력 저장 | Frontend 처리 |
| --- | --- | --- | --- | --- |
|  | 200/204/기타 |  | 예/아니오 |  |

## 인증/세션 계약

| 항목 | 결정 | 담당 | 상태 |
| --- | --- | --- | --- |
| login endpoint |  | Backend | 확인 필요 |
| refresh endpoint |  | Backend | 확인 필요 |
| logout endpoint |  | Backend | 확인 필요 |
| token 저장 위치 | localStorage/sessionStorage/cookie/memory/기타 | Frontend/Backend/Security | 확인 필요 |
| refresh 정책 |  | Backend/Security | 확인 필요 |
| 401 처리 | refresh 우선/login 이동/오류 표시/기타 | Frontend/Backend | 확인 필요 |
| 403 처리 | 권한 없음 화면/오류 표시/기타 | Frontend/Backend | 확인 필요 |
| 자격증명 변경 시 세션 처리 | 모든 refresh token 무효화 / 현재 세션만 유지 / 다른 디바이스만 무효화 / 기타 | Backend/Security | 확인 필요 |

## 권한과 Endpoint 매핑

| 역할 | Endpoint | 허용 작업 | 제한 조건 | 403 조건 |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 공통 오류 응답

| Status | Code | 의미 | 사용자 메시지 기준 | Frontend 처리 |
| --- | --- | --- | --- | --- |
| 400 |  | 잘못된 요청 |  |  |
| 401 |  | 인증 실패 |  |  |
| 403 |  | 권한 없음 |  |  |
| 404 |  | 리소스 없음 |  |  |
| 500 |  | 서버 오류 |  |  |

## CORS와 Header 요구사항

| 항목 | 필요 여부 | 비고 |
| --- | --- | --- |
| `Authorization` header 허용 | 확인 필요 | bearerAuth 사용 시 필요 |
| `Content-Type: application/json` 허용 | 예 |  |
| credential 포함 | 확인 필요 | cookie session 사용 시 필요 |
| 허용 origin | 확인 필요 |  |

## Backend/API agent 확인 항목

- [ ] `docs/openapi.yaml` 또는 API 명세를 작성했습니다.
- [ ] `securitySchemes`와 endpoint별 `security`를 명시했습니다.
- [ ] request/response schema를 명시했습니다.
- [ ] 공통 error response schema를 명시했습니다.
- [ ] 401/403 의미를 구분했습니다.
- [ ] login/refresh/logout endpoint가 필요한 경우 명세에 포함했습니다.
- [ ] CORS에서 `Authorization` header 허용 여부를 확인했습니다.

## Frontend agent 확인 항목

- [ ] OpenAPI 명세를 기준으로 API client를 구현할 수 있습니다.
- [ ] `VITE_API_BASE_URL` 등 base URL 주입 방식을 확인했습니다.
- [ ] bearerAuth가 있으면 token provider scaffold를 만들 수 있습니다.
- [ ] 로그인/refresh/logout endpoint가 없으면 임의 구현하지 않습니다.
- [ ] 401/403 처리 정책이 없으면 `api-integration-map.md` 오픈 이슈로 남깁니다.
- [ ] 백엔드 미기동, CORS, 인증 미합의 runtime 이슈를 실패가 아닌 통합 이슈로 기록합니다.

## 오픈 이슈

| ID | 이슈 | 영향 | 담당자 | 선행 이슈 | 상태 |
| --- | --- | --- | --- | --- | --- |
| API-CONTRACT-OPEN-001 |  |  |  |  | Open |

복수 이슈는 ID를 순서대로 증가하며 추가합니다 (API-CONTRACT-OPEN-002, …). 의존 관계가 있는 이슈는 "선행 이슈" 컬럼에 선행 이슈 ID를 기록합니다.
