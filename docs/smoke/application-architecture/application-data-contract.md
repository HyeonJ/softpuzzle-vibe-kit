# Application Data Contract

프로그램 상세 설계와 DB 설계가 공유하는 데이터 계약 문서입니다.

## 문서 정보

- 프로젝트: app-front-smoke
- 도메인: User Management
- 기준 요구사항: `docs/smoke/application-architecture/sample-feature.md`
- 기준 프로그램 설계서: `docs/smoke/application-architecture/detail-design.md`
- 기준 DB 설계서: `docs/smoke/application-architecture/db-design.md`
- 작성자: Application Architecture agent smoke
- 작성일: 2026-04-27

## 도메인 엔티티

| 엔티티 | 설명 | 소유 모듈 | 주요 식별자 | 비고 |
| --- | --- | --- | --- | --- |
| User | 시스템 사용자 | User module | `id` | 기존 엔티티 |
| UserStatusHistory | 사용자 상태 변경 이력 | User module | `id` | 신규 엔티티 |

## 상태값

| 엔티티 | 상태 | 의미 | 생성 조건 | 다음 상태 | 종료 상태 여부 |
| --- | --- | --- | --- | --- | --- |
| User | pending | 승인 대기 | 사용자 등록 | active, inactive | 아니오 |
| User | active | 정상 사용자 | 승인 또는 재활성화 | inactive | 아니오 |
| User | inactive | 비활성 사용자 | 비활성 처리 | active | 아니오 |

## 정책과 데이터 영향

| 정책 ID | 정책 | 영향 엔티티 | 필요한 컬럼/관계 | 이력 필요 | 비고 |
| --- | --- | --- | --- | --- | --- |
| POL-001 | admin은 모든 사용자 상태 변경 가능 | User, UserStatusHistory | users.role, users.status | 예 | 자기 자신 제외 |
| POL-002 | manager는 member만 active/inactive 변경 가능 | User, UserStatusHistory | users.role, users.status | 예 | targetStatus는 active/inactive만 허용 |
| POL-003 | member는 상태 변경 불가 | User | users.role | 아니오 | 403 |
| POL-004 | 자기 자신 상태 변경 불가 | User | users.id, actor.id | 아니오 | 400 |
| POL-005 | inactive -> inactive는 no-op 성공 | User | users.status | 아니오 | 이력 저장 안 함 |
| POL-006 | 상태 변경 성공 시 이력 저장 | UserStatusHistory | before_status, after_status, changed_by | 예 | 감사 |

## 권한과 데이터 접근

| 역할 | 접근 엔티티 | 허용 작업 | 제한 조건 | 감사 로그 필요 |
| --- | --- | --- | --- | --- |
| admin | User, UserStatusHistory | 상태 변경, 이력 조회 | 자기 자신 변경 불가 | 예 |
| manager | User, UserStatusHistory | member를 active/inactive로 변경 | admin/manager 변경 불가, targetStatus pending 불가 | 예 |
| member | User | 조회 | 상태 변경 불가 | 권한 실패 시 예 |

## 관계와 소유권

| 상위 엔티티 | 하위 엔티티 | 관계 | 삭제 정책 | 비고 |
| --- | --- | --- | --- | --- |
| User | UserStatusHistory | 1:N | restrict | 이력 보존 |
| User(changed_by) | UserStatusHistory | 1:N | restrict | 변경자 참조 |

## 이력과 감사

| 대상 | 기록 시점 | 기록 항목 | 보존 기간 | 비고 |
| --- | --- | --- | --- | --- |
| UserStatusHistory | 실제 상태 변경 성공 시 | userId, beforeStatus, afterStatus, changedBy, reason, createdAt | 정책 확인 필요 | inactive -> inactive no-op은 저장 안 함 |
| 권한 실패 | 403 발생 시 | actorId, targetUserId, action, reason | 정책 확인 필요 | 보안 로그 또는 감사 로그 |

## 데이터 보존과 삭제

| 엔티티 | 삭제 방식 | 보존 기간 | 복구 가능 여부 | 비고 |
| --- | --- | --- | --- | --- |
| User | soft-delete 권장 | 정책 확인 필요 | 가능 | 기존 사용자 설계와 맞춰야 함 |
| UserStatusHistory | hard-delete 금지 권장 | 정책 확인 필요 | 해당 없음 | 감사 목적 |

## 정합성 체크

| 항목 | 확인 결과 | 비고 |
| --- | --- | --- |
| 프로그램 정책이 필요한 컬럼/관계로 반영되었습니다. | 예 | users.role, users.status, history 관계 |
| 권한 조건을 판단할 데이터가 존재합니다. | 예 | actor.id/role, target.id/role/status 필요 |
| 상태 전이를 저장할 구조가 있습니다. | 예 | users.status, user_status_histories |
| 이력/감사 요구사항이 DB 설계에 반영되었습니다. | 예 | UserStatusHistory |
| 삭제/보존 정책이 명확합니다. | 부분 | 보존 기간은 확인 필요 |

## 오픈 이슈

| ID | 이슈 | 영향 | 담당자 | 상태 |
| --- | --- | --- | --- | --- |
| DATA-CONTRACT-OPEN-001 | 이력 보존 기간 확정 필요 | DB 보존 정책과 운영 비용 영향 | PM/Security | Open |
| DATA-CONTRACT-OPEN-002 | 권한 실패 로그를 DB 감사 테이블에 남길지 로깅 시스템에만 남길지 결정 필요 | 감사 추적 방식 영향 | Backend/Security | Open |
