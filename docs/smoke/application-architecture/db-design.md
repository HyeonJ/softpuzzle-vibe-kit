# DB 설계

## 문서 정보

- 프로젝트: app-front-smoke
- 도메인: User Management
- 기준 요구사항: `docs/smoke/application-architecture/sample-feature.md`
- 기준 프로그램 설계서: `docs/smoke/application-architecture/detail-design.md`
- 기준 application-data-contract: `docs/smoke/application-architecture/application-data-contract.md`
- 작성자: Application Architecture agent smoke
- 작성일: 2026-04-27

## 엔티티

| 엔티티 | 목적 | 담당자 |
| --- | --- | --- |
| User | 사용자 기본 정보와 현재 상태 저장 | User module |
| UserStatusHistory | 사용자 상태 변경 이력 저장 | User module |

## 테이블

| 테이블 | 설명 | Primary Key |
| --- | --- | --- |
| users | 사용자 기본 정보 | id |
| user_status_histories | 사용자 상태 변경 이력 | id |

## 컬럼

스키마 정의서는 테이블별로 컬럼을 분리합니다. 여러 테이블을 한 표에 합치면 전체 검색에는 편하지만, 실무 검토와 구현 인수인계에서는 테이블별 정의가 더 명확합니다.

### users

| 컬럼 | 타입 | Nullable | 기본값 | 제약/인덱스 | 비고 |
| --- | --- | --- | --- | --- | --- |
| id | varchar(36) | No |  | PK | 사용자 ID |
| name | varchar(100) | No |  |  | 사용자명 |
| email | varchar(255) | No |  | unique | 이메일 |
| role | varchar(30) | No | member | check | admin/manager/member |
| status | varchar(30) | No | pending | check, index | pending/active/inactive |
| created_at | timestamp | No | now |  | 생성일 |
| updated_at | timestamp | No | now |  | 수정일 |
| deleted_at | timestamp | Yes | null | index 후보 | soft delete 사용 시 |

### user_status_histories

| 컬럼 | 타입 | Nullable | 기본값 | 제약/인덱스 | 비고 |
| --- | --- | --- | --- | --- | --- |
| id | varchar(36) | No |  | PK | 이력 ID |
| user_id | varchar(36) | No |  | FK, index | 대상 사용자 |
| before_status | varchar(30) | No |  | check | 변경 전 상태 |
| after_status | varchar(30) | No |  | check | 변경 후 상태 |
| changed_by | varchar(36) | No |  | FK, index | 변경자 사용자 ID |
| reason | varchar(500) | Yes | null |  | 변경 사유 |
| created_at | timestamp | No | now | index | 변경 시각 |

## 관계

| From | To | 관계 | 설명 | 삭제 정책 |
| --- | --- | --- | --- | --- |
| users.id | user_status_histories.user_id | 1:N | 대상 사용자 이력 | restrict |
| users.id | user_status_histories.changed_by | 1:N | 변경자 | restrict |

## 제약조건

| 테이블 | 제약조건 | 컬럼 | 설명 |
| --- | --- | --- | --- |
| users | unique | email | 이메일 중복 방지 |
| users | check | role | admin/manager/member 중 하나 |
| users | check | status | pending/active/inactive 중 하나 |
| user_status_histories | check | before_status | pending/active/inactive 중 하나 |
| user_status_histories | check | after_status | pending/active/inactive 중 하나 |
| user_status_histories | foreign key | user_id | users.id 참조 |
| user_status_histories | foreign key | changed_by | users.id 참조 |

## 인덱스

| 테이블 | 인덱스 | 컬럼 | Unique | 이유 |
| --- | --- | --- | --- | --- |
| users | idx_users_email | email | Yes | 로그인/검색 후보 |
| users | idx_users_role_status | role, status | No | 권한/목록 필터 |
| users | idx_users_status | status | No | 상태별 조회 |
| user_status_histories | idx_user_status_histories_user_created | user_id, created_at | No | 사용자별 이력 조회 |
| user_status_histories | idx_user_status_histories_changed_by | changed_by | No | 변경자 감사 조회 |

## 마이그레이션

| 순서 | 변경 내용 | 영향 | 롤백 |
| --- | --- | --- | --- |
| 1 | users.status 컬럼 확인 또는 추가 | 기존 사용자 상태 기본값 필요 | 컬럼 제거 또는 기존 상태 복구 |
| 2 | user_status_histories 테이블 생성 | 상태 변경 이력 저장 가능 | 테이블 drop |
| 3 | users role/status check 제약 추가 | 잘못된 상태값 방지 | 제약 제거 |
| 4 | 인덱스 추가 | 조회 성능 개선 | 인덱스 제거 |

## 보존/삭제/감사 정책

| 대상 | 정책 | 보존 기간 | 감사 로그 | 비고 |
| --- | --- | --- | --- | --- |
| users | soft-delete 권장 | 정책 확인 필요 | 상태 변경은 이력 저장 | 기존 정책 필요 |
| user_status_histories | 삭제 금지 권장 | 정책 확인 필요 | 자체가 감사 데이터 | 운영 정책 필요 |

## 정합성 체크

| 항목 | 확인 결과 | 비고 |
| --- | --- | --- |
| 프로그램 정책이 DB 구조에 반영되었습니다. | 예 | role/status/history |
| 권한 판단에 필요한 데이터가 있습니다. | 예 | actor와 target의 id/role/status |
| 상태 전이를 저장할 구조가 있습니다. | 예 | users.status |
| 이력/감사 요구사항이 반영되었습니다. | 예 | user_status_histories |
| 삭제/보존 정책이 반영되었습니다. | 부분 | 보존 기간 확인 필요 |

## 오픈 이슈

| ID | 이슈 | 영향 | 담당자 | 상태 |
| --- | --- | --- | --- | --- |
| DB-OPEN-001 | users 테이블의 기존 role/status 타입과 enum/check 사용 여부 확인 필요 | 마이그레이션 방식 영향 | Backend/DB | Open |
| DB-OPEN-002 | 이력 보존 기간과 개인정보 정책 확인 필요 | 보존 정책 영향 | PM/Security | Open |
| DB-OPEN-003 | `reason` 컬럼을 nullable로 둘지 필수로 둘지 확정 필요 | 감사 데이터 품질 영향 | PM/Backend | Open |
