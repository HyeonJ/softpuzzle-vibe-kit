---
name: frontend-development
description: 프론트 화면, 라우팅, 상태 관리, API 연동, 폼 동작, 권한 처리, 로딩/오류 상태, 접근성, 테스트를 구현합니다.
---

# 프론트 개발

이 스킬은 애플리케이션 프론트엔드 동작을 구현할 때 사용합니다.

퍼블리싱 품질 기준은 `publishing` 스킬에서 다루고, 이 스킬은 화면이 실제 앱으로 동작하는 데 필요한 연결과 상태를 담당합니다.

## publishing 스킬과의 관계

Frontend agent는 퍼블리싱과 프론트 앱 개발을 모두 담당합니다.

- 디자인 기반 UI 구현, 반응형, 접근성, 디자인 토큰, 품질 게이트는 `publishing` 스킬을 따릅니다.
- 라우팅, 상태 관리, API 연동, 폼 검증, 권한 처리, 테스트는 `frontend-development` 스킬을 따릅니다.
- Figma URL 또는 handoff spec이 있으면 `publish-harness-codex` 연동을 먼저 검토합니다.

## 참조 문서

```text
standards/frontend/frontend-quality.md
templates/frontend/frontend-connect-plan.md
templates/frontend/api-integration-map.md
templates/frontend/frontend-screen-checklist.md
templates/frontend/component-inventory.md
templates/frontend/frontend-handoff.md
```

## 프로젝트 분석

기존 프론트 프로젝트 또는 퍼블 결과 React 프로젝트에 API와 앱 동작을 연결하기 전에 프로젝트 프로필을 생성합니다.

```bash
node scripts/inspect-frontend-project.mjs --project <frontend-project>
```

생성 결과:

```text
<frontend-project>/docs/frontend-project-profile.md
```

프로필을 통해 라우터, API client, 상태 관리, 폼/검증, 테스트 도구, 빌드 명령을 확인한 뒤 `frontend-connect-plan.md`와 `api-integration-map.md`를 작성합니다.

API 명세가 있으면 API 명세 프로필도 생성합니다.

```bash
node scripts/inspect-api-spec.mjs --spec <api-spec>
```

생성 결과:

```text
<spec-dir>/api-spec-profile.md
```

`frontend-project-profile.md`와 `api-spec-profile.md`를 함께 확인한 뒤 `api-integration-map.md`를 작성합니다.

## API 연결 맵 생성

프론트 프로젝트와 API 명세를 모두 확인할 수 있으면 아래 순서로 연결 맵 초안을 생성합니다.

```bash
node scripts/inspect-frontend-project.mjs --project ./app --json > ./docs/frontend-project-profile.json

node scripts/inspect-api-spec.mjs --spec ./docs/openapi.json --json > ./docs/api-spec-profile.json

node scripts/create-api-integration-map.mjs \
  --frontend-profile ./docs/frontend-project-profile.json \
  --api-profile ./docs/api-spec-profile.json \
  --output ./docs/api-integration-map.md
```

연결 맵은 자동 생성 초안이므로 화면 ID, 화면명, 호출 시점, 상태 처리, 권한 조건은 수동으로 확인하고 보완합니다.

## 산출물

- 화면 구현
- 라우팅 구성
- 상태 관리 흐름
- API 연동
- 폼과 검증 동작
- 권한 및 guard 처리
- 로딩, 빈 상태, 오류 상태
- 프론트 테스트
- 남은 이슈와 가정

## 작업 절차

1. 요구사항, IA, 화면정의서, 디자인 메모, API 명세를 확인합니다.
2. `inspect-frontend-project.mjs` 또는 직접 탐색으로 기존 코드베이스의 라우팅, 상태 관리, API client, 컴포넌트 패턴을 먼저 확인합니다.
3. API 명세가 있으면 `inspect-api-spec.mjs`로 endpoint, 인증, 요청/응답, 오류 응답 후보를 확인합니다.
4. 필요한 화면 상태를 정의합니다.
5. 라우트와 화면 컴포넌트 구조를 구현합니다.
6. API 연동과 오류 처리를 추가합니다.
7. 폼 검증, 권한 처리, loading/empty/error 상태를 구현합니다.
8. 접근성과 키보드 사용성을 확인합니다.
9. 리스크에 맞춰 테스트를 추가합니다.
10. lint, typecheck, test, build 등 가능한 검증 명령을 실행합니다.
11. 남은 이슈와 다음 역할에 넘길 내용을 기록합니다.

## App Front Track 실행 규칙

퍼블 결과 프로젝트 또는 기존 React 프로젝트에 API를 연결할 때는 아래 순서를 따릅니다.

1. 프로젝트 감지
   - package manager
   - framework/router
   - API client 위치
   - env 사용 방식
   - 검증 명령
2. API 계약 확인
   - `docs/openapi.yaml`, `docs/openapi.json` 또는 지정된 OpenAPI 문서를 원천 계약으로 사용합니다.
   - `servers`, `security`, `paths`, `components.schemas`, `components.responses`를 확인합니다.
   - `docs/api-integration-map.md`가 있으면 함께 확인합니다.
3. mock/stub API를 real API 호출로 전환
   - 기존 화면 컴포넌트 계약은 최대한 유지합니다.
   - endpoint, path, method, request body만 OpenAPI 기준으로 교체합니다.
   - 404 등 기존 UI 상태와 연결된 동작은 보존합니다.
4. 공통 API client 정리
   - `VITE_API_BASE_URL` 같은 환경변수 기반 base URL을 지원합니다.
   - JSON request/response 처리를 중앙화합니다.
   - JSON error body의 `message` 후보를 추출합니다.
   - HTTP status, path, method, message를 담은 custom error를 사용합니다.
   - OpenAPI에 `bearerAuth`가 있으면 token provider 확장 포인트를 만듭니다.
   - 로그인, refresh endpoint가 계약에 없으면 임의로 만들지 않습니다.
5. 인증 계약 처리
   - OpenAPI에 `bearerAuth`가 있으면 `Authorization: Bearer <token>` 헤더 부착 구조는 구현할 수 있습니다.
   - 토큰 발급, refresh, 저장 위치, 401/403 처리 정책은 계약 문서에 `확인 필요`로 남깁니다.
   - 확정되지 않은 auth flow를 프론트가 임의로 만들지 않습니다.
6. 검증
   - typecheck, lint, build를 실행합니다.
   - 가능하면 dev server를 실행해 주요 화면을 확인합니다.
   - 백엔드 미기동으로 API runtime error가 발생하면 Track 실패로 보지 않고 원인과 기대 동작을 기록합니다.

## 인증과 백엔드 계약 경계

Frontend agent가 할 수 있는 일:

- OpenAPI 기준으로 프론트 API 호출 구현
- mock/stub API를 실제 endpoint 호출로 전환
- 공통 API client 유지보수
- bearer token 부착 구조 구현
- 화면별 loading/empty/error/permission denied 상태 처리
- API 호출 시점과 화면 매핑 문서 갱신
- 계약 불명확 항목을 `api-integration-map.md` 오픈 이슈에 기록

Frontend agent가 임의로 결정하면 안 되는 일:

- 로그인 endpoint 이름과 schema
- refresh token 정책
- token 저장 위치 최종 결정
- 401 시 refresh 우선인지 로그인 이동인지
- 백엔드 에러 포맷
- CORS 허용 정책

Backend agent 또는 API 담당자에게 요구할 산출물:

- `docs/openapi.yaml` 또는 API 명세 갱신
- login/refresh/logout endpoint 명세
- request/response schema
- `components.responses`의 공통 에러 포맷
- `securitySchemes`와 endpoint별 `security`
- 401/403 의미 구분
- CORS에서 `Authorization` 헤더 허용 여부

## 완료 기준

- 요구사항과 화면정의서의 핵심 동작이 구현되었습니다.
- 라우팅과 상태 전환이 명확합니다.
- API 성공/실패/로딩 처리가 구현되었습니다.
- 폼 검증과 오류 메시지가 사용자에게 보입니다.
- 권한 없음 또는 접근 제한 상태가 처리되었습니다.
- 모바일과 데스크톱에서 주요 흐름이 깨지지 않습니다.
- 기존 프로젝트의 품질 게이트를 통과했거나 실패 사유가 기록되었습니다.
- 백엔드 미기동, HTML fallback, CORS, 인증 미합의처럼 통합 전 단계에서 예상 가능한 runtime 이슈는 실패가 아니라 남은 이슈로 명확히 기록되었습니다.

