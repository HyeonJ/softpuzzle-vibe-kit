# Softpuzzle Vibe Kit 진행 현황

마지막 업데이트: 2026-04-27

## 전체 상태

- 현재 단계: 기본 골격 완료, Frontend agent App Front Track smoke 반영 완료
- 전체 완성도: 약 35%
- Frontend agent 완성도: 약 90%
- GitHub: `https://github.com/HyeonJ/softpuzzle-vibe-kit`
- 기본 브랜치: `main`

## 완료

### 프로젝트 골격

- Codex plugin manifest 추가: `.codex-plugin/plugin.json`
- 루트 작업 지침 추가: `AGENTS.md`
- 기본 폴더 구조 구성: `agents`, `skills`, `templates`, `standards`, `docs`, `integrations`, `scripts`, `tools`
- 한국어 사용자 문서 기준 정리
- 영어 식별자와 한글 설명을 함께 쓰는 규칙 정리
- Git 저장소 초기화 및 GitHub push 완료
- Application Architecture agent 방향 결정: `detail-design`과 `db-design`을 하나의 agent가 담당

### 프로젝트 수행 흐름

- 전체 수행 생명주기 문서 추가: `docs/delivery-lifecycle.md`
- 구현 로드맵 추가: `docs/implementation-roadmap.md`
- 산출물 품질 기준 추가: `standards/artifact-quality.md`
- 프로젝트 상태 표준 추가: `standards/project-state.md`

### 스킬 초안

다음 단계별 `SKILL.md` 초안을 추가했습니다.

- `pm-governance`
- `wbs-planning`
- `requirements-definition`
- `ia-screen-planning`
- `figma-design`
- `system-architecture`
- `security-performance`
- `dev-environment`
- `publishing`
- `detail-design`
- `db-design`
- `api-development`
- `frontend-development`
- `unit-testing`
- `integration-testing`
- `release-deployment`

### 산출물 템플릿

다음 템플릿을 추가했습니다.

- `project-brief.md`
- `wbs.md`
- `requirements.md`
- `ia.md`
- `screen-spec.md`
- `architecture.md`
- `db-design.md`
- `api-spec.md`
- `test-plan.md`
- `release-checklist.md`
- `frontend-connect-plan.md`
- `frontend-handoff.md`
- `frontend-screen-checklist.md`
- `api-integration-map.md`
- `component-inventory.md`
- `detail-design.md`
- `application-data-contract.md`
- `api-contract-handoff.md`

### Frontend agent

- Frontend agent 역할 정의 추가: `agents/frontend-agent.md`
- 역할 목록에 Frontend agent 반영: `agents/roles.md`
- Publishing Track과 App Frontend Track을 하나의 Frontend agent 안에 정리
- `publishing` 스킬과 `frontend-development` 스킬의 책임 경계 정리
- 프론트 품질 기준 추가: `standards/frontend/frontend-quality.md`
- `publish-harness-codex` 연동 문서 추가: `integrations/publish-harness-codex.md`
- Frontend agent profile schema 문서 추가: `docs/frontend-agent-profile-schema.md`
- Claude 리뷰 문서 보관: `docs/reviews/frontend-agent-review-2026-04-27.md`
- App Front Track 실전 smoke 결과를 `frontend-development` 스킬과 `frontend-agent` 역할 문서에 반영
- 프론트 전용 자산을 domain/track 기준 하위 디렉터리로 분리: `templates/frontend`, `standards/frontend`

### Application Architecture agent

- Application Architecture agent 역할 정의 추가: `agents/application-architecture-agent.md`
- `detail-design`과 `db-design` 스킬을 하나의 agent가 함께 사용하도록 방향 결정
- 프로그램 상세 설계 템플릿 추가: `templates/detail-design.md`
- 프로그램 설계와 DB 설계 공유 계약 템플릿 추가: `templates/application-data-contract.md`
- API/Backend/Frontend 인수인계 계약 템플릿 추가: `templates/api-contract-handoff.md`
- 나중에 Data Architecture agent로 분리 가능한 경계와 조건을 문서화

### Frontend agent 보조 스크립트

- 프론트 프로젝트 분석: `scripts/inspect-frontend-project.mjs`
- API 명세 분석: `scripts/inspect-api-spec.mjs`
- API 연동 맵 생성: `scripts/create-api-integration-map.mjs`
- Frontend agent smoke 검증: `scripts/smoke-frontend-agent.mjs`

지원 범위:

- Vite/React/TypeScript 감지
- React Router, Next Router 후보 감지
- API client, fetch 사용 흔적 감지
- 상태 관리, 폼/검증, 품질 도구 감지
- npm/pnpm/yarn/bun 패키지 매니저 감지
- monorepo/workspace 신호 감지
- OpenAPI JSON/YAML 분석
- Markdown API 명세의 기본 endpoint 추출
- OpenAPI `$ref` parameter resolve
- API integration map 초안 생성
- Windows PowerShell UTF-16 JSON 입력 방어

### 검증

다음 명령 통과를 확인했습니다.

```bash
npm run check
npm run smoke:frontend-agent
```

`app-front-smoke` 프로젝트 확인 결과:

- `npm run typecheck` 통과
- `npm run build` 통과
- `npm run lint` 통과
- `docs/openapi.yaml` 분석 성공
- `docs/api-integration-map.md` 생성 성공
- mock API를 OpenAPI 기준 실제 `fetch` 호출 구조로 전환 성공
- GitHub push 완료: `https://github.com/HyeonJ/app-front-smoke`
- 테스트 커밋: `2674167 Run app front track`

## App Front Track smoke 결과

대상 프로젝트: `app-front-smoke`

결론:

- App Front Track의 기본 목표인 mock/stub API를 OpenAPI 기반 실제 API client 구조로 전환하는 흐름은 성공했습니다.
- `GET /users`, `GET /users/{id}`, `POST /users` 연결 구조를 확인했습니다.
- `VITE_API_BASE_URL`, JSON request/response 처리, custom API error, bearer token 확장 포인트가 필요하다는 점을 확인했습니다.
- 백엔드 미기동 상태에서 Vite HTML fallback이 JSON parse error로 보일 수 있음을 확인했습니다.

반영한 교훈:

- OpenAPI에 `bearerAuth`가 있으면 token provider scaffold까지 Frontend agent가 구현할 수 있습니다.
- 로그인/refresh/logout endpoint가 없으면 임의로 만들지 않습니다.
- 인증/세션 정책은 `openapi.yaml`과 `api-integration-map.md`에 나누어 기록합니다.
- 백엔드 미기동, CORS, 인증 미합의 같은 runtime 이슈는 Track 실패가 아니라 남은 통합 이슈로 기록합니다.

## 진행 중

### Application Architecture agent smoke

대상 기능:

```text
docs/smoke/application-architecture/sample-feature.md
```

현재 상태:

- smoke 테스트용 샘플 기능 정의 완료
- 샘플 기능 기준 프로그램 설계서 작성 완료
- 샘플 기능 기준 application-data-contract 작성 완료
- 샘플 기능 기준 DB 설계서 작성 완료
- 샘플 기능 기준 api-contract-handoff 작성 완료
- smoke 산출물 내용 1차 리뷰 완료
- DB 설계서 컬럼 표는 테이블별 분리 방식으로 보강
- smoke 리뷰 결과를 Application Architecture agent, detail-design, db-design, application-data-contract, api-contract-handoff 템플릿에 반영 완료
- 다음 단계는 Application Architecture agent 완성도 재평가와 다음 agent/skill 우선순위 결정입니다.

## 다음 작업

우선순위 순서입니다.

1. Application Architecture agent 완성도 재평가
2. PM/WBS/Requirements 쪽 스킬을 실제 업무 수준으로 구체화
3. IA/화면정의/디자인 워크플로우 구체화
4. API/Backend agent 또는 skill 세부화
5. QA/Release 워크플로우 구체화
6. Marketplace 배포 전 metadata, icon, screenshot, privacy/terms URL 정리

## 보류

- Figma mode full smoke test
- Marketplace용 스크린샷과 아이콘 실물 정리
- plugin privacy/terms URL 확정
- 조직용 remote 또는 public/private 정책 확정
- publish-harness-codex 자체 고도화
- 다른 framework(Vue, Svelte, Next.js) smoke 검증

## 리스크와 메모

- 현재 Frontend agent는 1차 사용 가능 수준이지만, 실제 프로젝트 적용 결과에 따라 지침을 더 줄여야 합니다.
- `templates`와 `standards`는 아직 루트에 평평하게 있습니다. 자산이 늘어나면 domain별 하위 디렉터리로 나누는 것이 좋습니다.
- 일부 plugin metadata에는 임시값이 남아 있습니다. 배포 전 확정해야 합니다.
- `publish-harness-codex`는 별도 프로젝트이며, 이 kit에서는 연동 가이드와 호출 규칙만 관리합니다.

