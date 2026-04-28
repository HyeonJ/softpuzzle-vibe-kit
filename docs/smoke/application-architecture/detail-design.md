# 프로그램 상세 설계서

## 문서 정보

- 프로젝트: app-front-smoke
- 기능/도메인: 사용자 상태 변경 / User Management
- 기준 요구사항: `docs/smoke/application-architecture/sample-feature.md`
- 기준 화면: 사용자 목록, 사용자 상세
- 기준 API: 기존 사용자 API + 상태 변경 API 후보
- 작성자: Application Architecture agent smoke
- 작성일: 2026-04-27

## 기능 개요

- 목적: 관리자가 정책에 따라 사용자 상태를 변경하고 변경 이력을 남깁니다.
- 사용자: `admin`, `manager`
- 주요 시나리오: 사용자 목록 또는 상세 화면에서 상태를 선택해 변경합니다.
- 제외 범위: login/refresh/logout, 사용자 생성, 사용자 삭제, 역할 변경

## 모듈과 책임

| 모듈/컴포넌트 | 책임 | 입력 | 출력 | 비고 |
| --- | --- | --- | --- | --- |
| UserStatusService | 상태 변경 정책 검증과 변경 실행 | actor, targetUserId, targetStatus, reason | 변경된 User | Backend 구현 대상 |
| UserPolicy | 역할별 상태 변경 가능 여부 판단 | actorRole, actorId, targetUser, targetStatus | 허용/거부 결과 | 프로그램 정책 |
| UserStatusHistoryWriter | 상태 변경 이력 저장 | userId, beforeStatus, afterStatus, actorId, reason | history row | 감사 로그 |
| UserRepository | 사용자 조회/저장 | userId, status | User | DB 접근 |

## 서비스 흐름

| 단계 | 행위자 | 처리 | 성공 결과 | 실패/예외 |
| --- | --- | --- | --- | --- |
| 1 | Frontend | 상태 변경 API 호출 | 요청 전달 | 인증 토큰 없음 |
| 2 | Backend | bearer token 검증 | actor 식별 | 401 |
| 3 | UserRepository | 대상 사용자 조회 | targetUser 확보 | 404 |
| 4 | UserPolicy | 자기 자신 변경 여부 확인 | 다음 정책 확인 | 400 |
| 5 | UserPolicy | 역할별 변경 권한 확인 | 변경 허용 | 403 |
| 6 | UserStatusService | 상태값 유효성 확인 | 변경 가능 | 400 |
| 7 | UserStatusService | 사용자 상태 변경 | User 저장 | DB 오류 |
| 8 | UserStatusHistoryWriter | 변경 이력 저장 | history 저장 | DB 오류 |
| 9 | Backend | 변경된 User 반환 | 200 | 500 |

## 정책

| ID | 정책 | 적용 조건 | 예외 | 비고 |
| --- | --- | --- | --- | --- |
| POL-001 | `admin`은 모든 사용자의 상태를 변경할 수 있습니다. | actor.role = `admin` | 자기 자신 상태 변경은 불가 | POL-004 우선 |
| POL-002 | `manager`는 `member` 역할 사용자만 상태 변경할 수 있습니다. | actor.role = `manager`, target.role = `member` | targetStatus는 `active` 또는 `inactive`만 허용 | `pending` 사용자를 active/inactive로 변경하는 것은 허용 |
| POL-003 | `member`는 사용자 상태를 변경할 수 없습니다. | actor.role = `member` | 없음 | 403 |
| POL-004 | 자기 자신의 상태는 변경할 수 없습니다. | actor.id = target.id | 없음 | 400 |
| POL-005 | 이미 `inactive`인 사용자를 `inactive`로 변경하면 변경 없이 성공 처리합니다. | target.status = `inactive`, request.status = `inactive` | 이력 저장 안 함 | idempotent 처리 |
| POL-006 | 상태 변경 성공 시 변경 이력을 저장합니다. | beforeStatus != afterStatus | 없음 | 감사 목적 |

## 권한

| 역할 | 허용 기능 | 제한 기능 | 비고 |
| --- | --- | --- | --- |
| admin | 모든 사용자 상태 변경 | 자기 자신 상태 변경 | 모든 target role 가능 |
| manager | member 상태를 active/inactive로 변경 | admin/manager 변경, pending 변경, 자기 자신 변경 | 제한 관리자 |
| member | 없음 | 모든 상태 변경 | 조회만 가능 |

## 상태와 전이

| 상태 | 의미 | 진입 조건 | 다음 상태 | 비고 |
| --- | --- | --- | --- | --- |
| pending | 승인 대기 | 사용자 등록 직후 | active, inactive | manager는 pending 사용자를 active/inactive로 변경 가능 |
| active | 정상 사용자 | 승인 또는 재활성화 | inactive |  |
| inactive | 비활성 사용자 | 비활성 처리 | active | inactive -> inactive는 성공 no-op |

## 예외 케이스

| ID | 상황 | 처리 방식 | 사용자 메시지 | 로그/감사 필요 |
| --- | --- | --- | --- | --- |
| EX-001 | 인증 정보 없음 | 401 반환 | 인증이 필요합니다. | 보안 로그 |
| EX-002 | 대상 사용자 없음 | 404 반환 | 사용자를 찾을 수 없습니다. | 일반 로그 |
| EX-003 | 자기 자신 상태 변경 | 400 반환 | 자기 자신의 상태는 변경할 수 없습니다. | 감사 로그 |
| EX-004 | 권한 없음 | 403 반환 | 이 사용자의 상태를 변경할 권한이 없습니다. | 감사 로그 |
| EX-005 | 허용되지 않은 상태값 | 400 반환 | 변경할 수 없는 상태입니다. | 일반 로그 |
| EX-006 | DB 저장 실패 | 500 반환 | 상태 변경 중 오류가 발생했습니다. | 오류 로그 |

## 데이터 영향

| 엔티티 | 생성 | 조회 | 수정 | 삭제 | 이력 필요 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| User | 아니오 | 예 | status, updatedAt | 아니오 | 예 | 상태 변경 대상 |
| UserStatusHistory | 예 | 예 | 아니오 | 아니오 | 예 | 변경 이력 |

## API 영향

| 기능 | Method | Endpoint | 요청 | 응답 | 비고 |
| --- | --- | --- | --- | --- | --- |
| 사용자 상태 변경 | PATCH | `/users/{id}/status` | `UpdateUserStatusRequest` | `User` | bearerAuth 필요 |

## API 계약 요구사항

| 항목 | 요구사항 | 확정 여부 | 비고 |
| --- | --- | --- | --- |
| OpenAPI 명세 위치 | `docs/openapi.yaml` | 확인 필요 | API/Backend agent가 갱신 |
| 공통 응답 포맷 | raw `User` 또는 `{ success, data }` | 확인 필요 | 기존 app-front-smoke는 raw JSON 가정 |
| 공통 오류 포맷 | `ErrorResponse { success, message }` | 초안 | 기존 OpenAPI와 맞춤 |
| 인증 방식 | bearerAuth | 확정 | sample-feature 기준 |
| 401 의미 | 인증 없음 또는 토큰 유효하지 않음 | 확인 필요 | Backend/Security 확인 |
| 403 의미 | 인증은 되었지만 권한 없음 | 확정 | 권한 정책 기준 |
| CORS Authorization header | 필요 | 확인 필요 | bearerAuth 사용 |

## 인증/세션 정책

| 항목 | 정책 | 담당 | 상태 |
| --- | --- | --- | --- |
| login endpoint 필요 여부 | 본 기능 범위 밖 | Backend | 확인 필요 |
| refresh endpoint 필요 여부 | 본 기능 범위 밖 | Backend | 확인 필요 |
| logout endpoint 필요 여부 | 본 기능 범위 밖 | Backend | 확인 필요 |
| token 저장 위치 | Frontend에서 확정하지 않음 | Frontend/Backend/Security | 확인 필요 |
| refresh 정책 | 본 기능 범위 밖 | Backend/Security | 확인 필요 |
| 권한 없음 처리 | 403과 사용자 메시지 표시 | Frontend/Backend | 초안 |

## API/Backend/Frontend 인수인계

| 대상 | 넘길 내용 | 산출물 | 상태 |
| --- | --- | --- | --- |
| API/Backend agent | `PATCH /users/{id}/status`, schema, error, bearerAuth 요구사항 | `api-contract-handoff.md` | 준비 |
| Frontend agent | OpenAPI 위치, 인증/오류 정책, mock/real 전환 조건 | `api-contract-handoff.md`, `api-integration-map.md` | 준비 |

## 구현 체크리스트

- [x] 모듈 책임이 명확합니다.
- [x] 정책과 예외 케이스가 분리되어 있습니다.
- [x] 권한 조건이 명확합니다.
- [x] 상태 전이가 정의되어 있습니다.
- [x] 데이터 생성/수정/삭제 영향이 정리되어 있습니다.
- [x] API와 화면 영향이 정리되어 있습니다.
- [x] API 계약 요구사항이 `api-contract-handoff.md`에 정리되어 있습니다.
- [x] 인증/세션 정책 중 미확정 항목이 오픈 이슈로 남아 있습니다.

## 오픈 이슈

| ID | 이슈 | 영향 | 담당자 | 상태 |
| --- | --- | --- | --- | --- |
| APP-OPEN-001 | 공통 응답 포맷이 raw JSON인지 wrapper인지 확정 필요 | API client 구현 방식 영향 | Backend/API | Open |
| APP-OPEN-002 | login/refresh/logout 명세가 없음 | 인증 전체 흐름 구현 불가 | Backend/Security | Open |
| APP-OPEN-003 | 상태 변경 reason을 필수로 받을지 선택으로 둘지 확정 필요 | 감사 이력 품질 영향 | PM/Backend | Open |
