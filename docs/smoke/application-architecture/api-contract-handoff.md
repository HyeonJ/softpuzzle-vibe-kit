# API Contract Handoff

Application Architecture agent가 API/Backend agent와 Frontend agent에게 넘기는 API 계약 요구사항입니다.

## 문서 정보

- 프로젝트: app-front-smoke
- 도메인: User Management
- 기준 프로그램 설계서: `docs/smoke/application-architecture/detail-design.md`
- 기준 application-data-contract: `docs/smoke/application-architecture/application-data-contract.md`
- 기준 DB 설계서: `docs/smoke/application-architecture/db-design.md`
- 작성자: Application Architecture agent smoke
- 작성일: 2026-04-27

## API 계약 원칙

| 항목 | 결정 | 비고 |
| --- | --- | --- |
| API 명세 원천 | `docs/openapi.yaml` | Backend/API agent가 갱신 |
| Base URL 정책 | `VITE_API_BASE_URL`로 주입 가능해야 함 | Frontend agent 기준 |
| 응답 포맷 | raw `User` 우선, wrapper 여부 확인 필요 | 기존 smoke API와 맞춤 |
| 오류 포맷 | `ErrorResponse { success, message }` | 기존 OpenAPI와 맞춤 |
| 인증 방식 | bearerAuth | Authorization header 필요 |
| 401 의미 | 인증 없음 또는 토큰 유효하지 않음 | 확인 필요 |
| 403 의미 | 인증은 되었지만 상태 변경 권한 없음 | 확정 |

## Endpoint 요구사항

| 기능 | Method | Endpoint 후보 | 인증 필요 | 요청 | 응답 | 오류 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 사용자 상태 변경 | PATCH | `/users/{id}/status` | 예 | `UpdateUserStatusRequest` | `User` | 400, 401, 403, 404, 500 | 상태 변경 후 최신 User 반환 |

## Request/Response Schema 요구사항

| 이름 | 구분 | 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- | --- |
| UpdateUserStatusRequest | request | status | UserStatus | 예 | 변경할 상태 |
| UpdateUserStatusRequest | request | reason | string | 아니오 | 변경 사유. 필수 여부 확인 필요 |
| User | response | id | string | 예 | 사용자 ID |
| User | response | name | string | 예 | 사용자명 |
| User | response | email | string | 예 | 이메일 |
| User | response | role | UserRole | 예 | 역할 |
| User | response | status | UserStatus | 예 | 변경된 상태 |
| User | response | createdAt | string(date-time) | 예 | 생성일 |
| ErrorResponse | error | success | boolean | 예 | false |
| ErrorResponse | error | message | string | 예 | 사용자 또는 개발자 메시지 |

## 인증/세션 계약

| 항목 | 결정 | 담당 | 상태 |
| --- | --- | --- | --- |
| login endpoint | 본 기능 범위 밖 | Backend | 확인 필요 |
| refresh endpoint | 본 기능 범위 밖 | Backend | 확인 필요 |
| logout endpoint | 본 기능 범위 밖 | Backend | 확인 필요 |
| token 저장 위치 | Frontend가 임의 확정하지 않음 | Frontend/Backend/Security | 확인 필요 |
| refresh 정책 | 본 기능 범위 밖 | Backend/Security | 확인 필요 |
| 401 처리 | 인증 필요 메시지 또는 로그인 이동 | Frontend/Backend | 확인 필요 |
| 403 처리 | 권한 없음 메시지 표시 | Frontend/Backend | 초안 |

## 권한과 Endpoint 매핑

| 역할 | Endpoint | 허용 작업 | 제한 조건 | 403 조건 |
| --- | --- | --- | --- | --- |
| admin | `PATCH /users/{id}/status` | 모든 target role 상태 변경 | 자기 자신 제외 | 자기 자신은 400 |
| manager | `PATCH /users/{id}/status` | member를 active/inactive로 변경 | admin/manager 변경 불가, targetStatus pending 불가 | target이 member가 아니거나 targetStatus가 pending |
| member | `PATCH /users/{id}/status` | 없음 | 모든 상태 변경 불가 | 항상 403 |

## 공통 오류 응답

| Status | Code | 의미 | 사용자 메시지 기준 | Frontend 처리 |
| --- | --- | --- | --- | --- |
| 400 | INVALID_STATUS_CHANGE | 잘못된 상태 변경 요청 | 변경할 수 없는 상태입니다. | error state |
| 400 | SELF_STATUS_CHANGE_NOT_ALLOWED | 자기 자신 상태 변경 | 자기 자신의 상태는 변경할 수 없습니다. | error state |
| 401 | UNAUTHORIZED | 인증 실패 | 인증이 필요합니다. | 인증 필요 처리 |
| 403 | FORBIDDEN | 권한 없음 | 이 사용자의 상태를 변경할 권한이 없습니다. | permission denied 또는 error state |
| 404 | USER_NOT_FOUND | 대상 없음 | 사용자를 찾을 수 없습니다. | not found state |
| 500 | INTERNAL_SERVER_ERROR | 서버 오류 | 상태 변경 중 오류가 발생했습니다. | error state |

## CORS와 Header 요구사항

| 항목 | 필요 여부 | 비고 |
| --- | --- | --- |
| `Authorization` header 허용 | 예 | bearerAuth 사용 |
| `Content-Type: application/json` 허용 | 예 | PATCH body JSON |
| credential 포함 | 확인 필요 | cookie session을 쓰지 않으면 불필요 |
| 허용 origin | 확인 필요 | 로컬/운영 환경별 확인 |

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

| ID | 이슈 | 영향 | 담당자 | 상태 |
| --- | --- | --- | --- | --- |
| API-CONTRACT-OPEN-001 | raw User 응답과 wrapper 응답 중 최종 포맷 확정 필요 | Frontend API client unwrap 방식 영향 | Backend/API | Open |
| API-CONTRACT-OPEN-002 | login/refresh/logout endpoint 범위 확정 필요 | 인증 전체 흐름 영향 | Backend/Security | Open |
| API-CONTRACT-OPEN-003 | CORS 허용 origin과 credential 정책 확정 필요 | 로컬/운영 연동 영향 | Backend/DevOps | Open |
| API-CONTRACT-OPEN-004 | `reason` 필수 여부 확정 필요 | 프론트 폼 검증과 감사 이력 품질 영향 | PM/Backend/Frontend | Open |
