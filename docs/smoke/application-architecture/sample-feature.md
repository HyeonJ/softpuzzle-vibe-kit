# Application Architecture Smoke 샘플 기능

## 목적

Application Architecture agent가 프로그램 상세 설계, 데이터 계약, DB 설계, API 계약 인수인계를 실제로 작성할 수 있는지 검증하기 위한 샘플 기능입니다.

기존 `app-front-smoke`의 사용자 관리 도메인과 이어지도록 **사용자 상태 변경과 권한 정책** 기능을 사용합니다.

## 샘플 기능

기능명: 사용자 상태 변경

사용자 관리 화면에서 관리자가 사용자의 상태를 변경합니다.

지원 상태:

- `active`: 정상 사용자
- `inactive`: 비활성 사용자
- `pending`: 승인 대기 사용자

상태 변경 규칙:

- `admin`은 모든 사용자의 상태를 변경할 수 있습니다.
- `manager`는 `member` 역할 사용자만 `active` 또는 `inactive`로 변경할 수 있습니다.
- `member`는 사용자 상태를 변경할 수 없습니다.
- 자기 자신의 상태는 변경할 수 없습니다.
- 이미 `inactive`인 사용자를 다시 `inactive`로 변경하는 요청은 변경 없이 성공 처리합니다.
- 상태 변경 시 변경 이력을 남겨야 합니다.

## 주요 시나리오

### 성공

1. 관리자가 사용자 목록에서 상태 변경 버튼을 선택합니다.
2. 변경할 상태를 선택합니다.
3. 시스템은 권한과 정책을 확인합니다.
4. 사용자 상태를 변경합니다.
5. 상태 변경 이력을 저장합니다.
6. 변경된 사용자 정보를 반환합니다.

### 실패

| 상황 | 기대 처리 |
| --- | --- |
| 권한 없는 사용자가 요청 | 403 |
| 존재하지 않는 사용자 | 404 |
| 자기 자신의 상태 변경 | 400 |
| 허용되지 않은 상태값 | 400 |
| manager가 admin/manager 상태 변경 | 403 |
| 인증 정보 없음 | 401 |

## 입력 조건

- API는 bearerAuth를 사용합니다.
- 인증된 사용자의 역할과 ID를 서버가 알 수 있다고 가정합니다.
- login/refresh/logout endpoint는 아직 설계 대상이 아닙니다.
- 기존 사용자 API는 `GET /users`, `GET /users/{id}`, `POST /users`가 있다고 가정합니다.

## 예상 산출물

Application Architecture agent는 이 샘플 기능으로 아래 산출물을 작성합니다.

```text
docs/smoke/application-architecture/detail-design.md
docs/smoke/application-architecture/application-data-contract.md
docs/smoke/application-architecture/db-design.md
docs/smoke/application-architecture/api-contract-handoff.md
```

## 검증 관점

작성된 산출물은 아래 질문에 답할 수 있어야 합니다.

- 누가 어떤 사용자 상태를 변경할 수 있는가?
- 상태 변경 정책이 프로그램 설계서에 명확한가?
- 상태 변경 이력을 저장할 DB 구조가 있는가?
- API/Backend agent가 OpenAPI를 작성할 수 있을 만큼 endpoint와 schema 요구사항이 명확한가?
- Frontend agent가 App Front Track에서 API client를 연결할 수 있을 만큼 인증, 오류, 401/403, CORS 조건이 정리되어 있는가?
- 확정되지 않은 인증/세션 정책이 임의 구현되지 않고 오픈 이슈로 남아 있는가?

