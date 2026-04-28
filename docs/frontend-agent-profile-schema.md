# Frontend Agent Profile Schema

Frontend agent 보조 스크립트가 주고받는 JSON profile 규격입니다. 파일명과 key는 영어로 유지하고, 사람이 읽는 설명은 한국어로 작성합니다.

## frontend-project-profile.json

`inspect-frontend-project.mjs --json` 출력입니다.

| Key | Type | 설명 |
| --- | --- | --- |
| `projectRoot` | string | 분석한 프론트 프로젝트의 절대 경로 |
| `packageName` | string | `package.json`의 `name` |
| `packageManager` | object | 감지된 패키지 매니저 정보 |
| `packageManager.name` | string | `npm`, `pnpm`, `yarn`, `bun` 중 하나 |
| `packageManager.runCommand` | string | script 실행 prefix. 예: `npm run`, `pnpm`, `yarn`, `bun run` |
| `workspace` | object | monorepo/workspace 감지 결과 |
| `workspace.detected` | boolean | workspace 신호 감지 여부 |
| `workspace.signals` | string[] | `package.json workspaces`, `pnpm-workspace.yaml`, `turbo.json` 등 감지된 신호 |
| `scripts` | object | `package.json scripts` 원본 |
| `frameworks` | detection[] | React, Vite, Next.js, Vue, Svelte, TypeScript 감지 결과 |
| `routing` | detection[] | React Router, TanStack Router, Next router, `src/routes` 감지 결과 |
| `api` | detection[] | axios, fetch, TanStack Query, SWR, RTK Query, OpenAPI client 후보 |
| `state` | detection[] | Zustand, Redux Toolkit, Recoil, Jotai, MobX, React local state 흔적 |
| `forms` | detection[] | react-hook-form, Formik, Zod, Yup |
| `quality` | detection[] | ESLint, TypeScript, Vitest, Jest, Playwright, Cypress, Testing Library |
| `directories` | detection[] | 주요 프론트 디렉터리 존재 여부 |
| `recommendedCommands` | command[] | lint/typecheck/test/build/dev/quality 실행 후보 |
| `sourceScan` | object | 소스 파일 스캔 통계 |
| `sourceScan.fileCount` | number | 스캔한 파일 수 |
| `sourceScan.limit` | number | 스캔 상한 |
| `sourceScan.limitReached` | boolean | 상한 도달 여부 |
| `notes` | string[] | Frontend agent가 수동 확인해야 할 메모 |

### detection

| Key | Type | 설명 |
| --- | --- | --- |
| `name` | string | 감지 항목 이름 |
| `detected` | boolean | 감지 여부 |
| `note` | string | 보충 설명 |

### command

| Key | Type | 설명 |
| --- | --- | --- |
| `name` | string | 검증 이름 |
| `script` | string | `package.json scripts`의 실제 script 값 |
| `command` | string | 사용자가 실행할 명령. 예: `npm run build`, `pnpm build` |

## api-spec-profile.json

`inspect-api-spec.mjs --json` 출력입니다.

| Key | Type | 설명 |
| --- | --- | --- |
| `specPath` | string | API 명세 파일 절대 경로 |
| `format` | string | `openapi-json`, `openapi-yaml`, `markdown`, `unknown` |
| `openapi` | string | OpenAPI/Swagger 버전 |
| `title` | string | API 문서 제목 |
| `version` | string | API 문서 버전 |
| `servers` | server[] | OpenAPI servers |
| `security` | object[] | 전역 security 설정 |
| `securitySchemes` | securityScheme[] | 인증 방식 정의 |
| `endpoints` | endpoint[] | endpoint 목록 |
| `errorResponses` | object[] | 오류 status별 endpoint 수 |
| `notes` | string[] | 수동 확인 메모 |

### endpoint

| Key | Type | 설명 |
| --- | --- | --- |
| `method` | string | HTTP method |
| `path` | string | endpoint path |
| `operationId` | string | OpenAPI operationId |
| `summary` | string | OpenAPI summary |
| `tags` | string[] | OpenAPI tags |
| `parameters` | parameter[] | path/query/header/cookie parameter |
| `hasRequestBody` | boolean | requestBody 존재 여부 |
| `responses` | string[] | 응답 status 목록 |
| `errors` | string[] | 4xx/5xx/default 응답 목록 |
| `security` | object[] | endpoint별 security 설정 |

### parameter

| Key | Type | 설명 |
| --- | --- | --- |
| `name` | string | parameter 이름 |
| `in` | string | `path`, `query`, `header`, `cookie` |
| `required` | boolean | 필수 여부 |
| `schema` | string | schema type 또는 schema 이름 |

## api-integration-map.md

`create-api-integration-map.mjs`는 위 두 JSON profile을 입력으로 받아 초안 Markdown을 생성합니다.

자동으로 채우는 항목:

- API 명세 출처
- 프론트 프로젝트 감지 결과
- Base URL, 인증 방식 후보
- endpoint 목록과 method/path/operationId
- 요청 parameter
- 응답 status
- 오류 status
- mock/real API 상태 초안

수동으로 확정해야 하는 항목:

- 화면 ID와 화면명
- 호출 시점
- 호출 컴포넌트
- 응답 body 필드와 화면 사용 여부
- loading/empty/error/permission 상태 처리
- mock에서 real API로 전환하는 조건
