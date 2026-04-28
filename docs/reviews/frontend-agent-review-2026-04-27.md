# Frontend Agent Review — 2026-04-27

리뷰 대상은 `vibe-project-kit` 안에서 Frontend agent와 관련된 자산입니다. 역할 정의, 스킬 두 종, 통합 문서, 표준, 템플릿 5종, 스크립트 3종을 검토했습니다.

검토 방법:

- 7개 문서 cross-reference로 역할 일관성 점검
- 3개 스크립트 코드 정독
- 실제 smoke 프로젝트(`smoke-publish-harness-codex-spec/app`)와 sample OpenAPI(`smoke-api-spec-inspect/openapi.json`)로 end-to-end 산출물 생성 흐름 재현

산출물 생성은 다음 순서로 정상 동작했습니다.

```bash
node scripts/inspect-frontend-project.mjs --project ./app --json > frontend-project-profile.json
node scripts/inspect-api-spec.mjs --spec ./openapi.json --json > api-spec-profile.json
node scripts/create-api-integration-map.mjs \
  --frontend-profile frontend-project-profile.json \
  --api-profile api-spec-profile.json \
  --output api-integration-map.md
```

## 현재 완성도

- 역할 정의: **거의 완성**. Frontend agent가 퍼블리싱과 앱 개발을 동시에 담당한다는 메시지가 7개 문서(`README.md`, `agents/frontend-agent.md`, `agents/roles.md`, `skills/publishing/SKILL.md`, `skills/frontend-development/SKILL.md`, `integrations/publish-harness-codex.md`, `standards/frontend-quality.md`) 전부에서 일관되게 유지됨.
- 스킬 분리: **완성**. publishing은 디자인 반영/반응형/접근성/품질 게이트, frontend-development는 라우팅/상태/API/폼/권한/테스트로 책임 경계가 명확.
- 템플릿 세트: **완성**. connect-plan(사전 계획), handoff(결과 보고), screen-checklist(화면별 체크), api-integration-map(API 매핑), component-inventory(컴포넌트 인벤토리)가 서로 다른 역할로 잘 분담됨.
- 스크립트 3종: **사용 가능 수준**. React/Vite + OpenAPI JSON 조합에서 정상 동작. 단 YAML OpenAPI 미지원, `$ref` 파라미터 resolve 누락 등 보완 항목 있음.
- 통합 문서: **Windows 환경 한정**. PowerShell 명령 예시만 있어 macOS/Linux는 추가 노력 필요.

종합: **베타 수준**. 실제 프로젝트에 바로 투입 가능하지만, OpenAPI YAML과 모노레포/패키지 매니저 차이가 나오기 시작하면 보강이 필요합니다.

## 잘 된 점

1. **역할 메시지 일관성**: `Frontend agent = 퍼블리싱 + 앱 개발`이 모든 문서에서 동일한 어휘로 반복됨. publishing/frontend-development 두 스킬은 자기 영역만 단언하고 다른 영역은 상대 스킬로 위임하는 구조가 깔끔함.
2. **스킬 frontmatter 규칙 준수**: 두 SKILL.md 모두 `name`/`description` frontmatter가 있고 `name`이 디렉터리명과 일치. `AGENTS.md`의 스킬 작성 규칙과 부합.
3. **publish-harness-codex 사용 조건/비조건이 분리**: API 연동, 라우팅, 권한, 폼 비즈니스 검증은 `publish-harness-codex` 책임 아니라고 명시. agent가 잘못된 도구를 잡을 가능성 줄어듦.
4. **3개 스크립트의 파이프라인 설계**: `--json` 출력을 다음 스크립트가 그대로 입력으로 받는 구조가 자연스럽고, `create-api-integration-map.mjs`는 두 profile을 합쳐 초안 markdown까지 생성함. 사람이 채워야 하는 칸은 `확인 필요`로 명시되어 빈칸 누락 위험이 적음.
5. **에러 메시지 친절**: `Project path is not a directory: ...`, `Missing value for --project`, `Failed to parse JSON: ... \n<error>` 등으로 어디서 막혔는지 즉시 확인 가능.
6. **언어/식별자 규칙 준수**: 한글 본문 + 영어 식별자(파일명, JSON key, 스킬 이름, CLI 옵션)가 모든 자산에서 일관됨. `AGENTS.md` 규칙과 일치.
7. **스크립트의 cross-platform 안전성**: `path.resolve`, `path.join`, `process.cwd()` 등 표준 node API만 사용. 외부 의존성 0개. Windows/macOS/Linux 모두 동일 동작 가능.
8. **smoke 흐름 재현 성공**: 실제 React + Vite 프로젝트와 mini OpenAPI JSON으로 3개 산출물(`frontend-project-profile.md`, `api-spec-profile.md`, `api-integration-map.md`)이 모두 사람이 채워 넣을 수 있는 형태로 생성됨.

## 문제 / 리스크

### 스크립트

1. **OpenAPI YAML 미지원** (`inspect-api-spec.mjs:98-113`): YAML 파일을 받으면 빈 profile에 메모만 남김. 실무 OpenAPI는 YAML이 더 흔해서 사용 빈도 높은 차단 지점. 현재는 "JSON으로 변환하거나 수동 확인" 안내만 있음.
2. **`$ref` 파라미터 resolve 누락** (`inspect-api-spec.mjs:248-256`): smoke 결과에서 `PageParam`은 실제 query param인데 `in: "$ref"`로 표시됨. components.parameters를 따라가서 실제 위치/스키마를 채워야 정확한 산출물이 됨.
3. **`scanFiles` 결정성과 한계** (`inspect-frontend-project.mjs:142-152`): `result.length < 500`에서 멈추고 `stack.pop()` LIFO로 처리해 큰 모노레포에서 fetch 사용 흔적을 놓칠 수 있음. 현재 코드/문서에 이 한계 표시 없음.
4. **profile에 ISO timestamp 포함** (`inspect-frontend-project.mjs:283`): `생성일: ${new Date().toISOString()}` 때문에 같은 입력으로도 매번 결과가 달라져 git diff 발생. `AGENTS.md`의 "도구는 결정적이고 반복 가능" 규칙과 어긋남.
5. **Markdown endpoint 추출 패턴이 좁음** (`inspect-api-spec.mjs:190`): `(GET|POST|...)\s+((?:\/|\{baseUrl\}\/|https?:\/\/)...)` 패턴이라 표 셀 안의 endpoint(`| GET | /users | ... |`)나 코드블록 안의 endpoint는 잡을 수 있지만, path 끝에 `|`나 ` `(공백)이 붙으면 짤림. 검증 케이스 없음.
6. **profile JSON 스키마 문서 부재**: `create-api-integration-map.mjs`는 `frontend.routing[]`, `frontend.api[]`, `frontend.recommendedCommands[]` 등을 가정. 다른 도구로 profile을 만들려면 코드를 읽어야 함.
7. **테스트/품질 도구 감지 갭** (`inspect-frontend-project.mjs:223-242`): `__tests__`, `e2e`, `playwright`, `cypress` 디렉터리는 검사 안 함. `tests`만 봄.
8. **패키지 매니저 hint 없음**: yarn/pnpm/bun 환경에서도 표에는 그냥 raw script만 나옴. `npm run lint` 같은 실행 hint가 있으면 더 친절했을 것.

### 문서

9. **`integrations/publish-harness-codex.md`가 PowerShell 전용**: `& 'C:\Program Files\Git\bin\bash.exe' ...` 예시뿐. 기본 사용자가 Windows라는 점은 이해되지만, 그래도 macOS/Linux 동등 예시 한 단락은 있어야 cross-platform 표방과 부합.
10. **`api-integration-map.md` 템플릿과 스크립트 출력의 미세 불일치**: 템플릿의 "응답" 표는 `필드 / 타입 / 설명 / 화면 사용 여부` 4개 컬럼. 스크립트 출력은 `Status / 설명` 2개 컬럼으로 축소됨. OpenAPI schema 기반 응답 필드 자동 추출까지는 안 하기 때문이므로 의도된 단순화이지만, "스크립트는 status만 채우고 schema는 수동" 한 줄 안내가 없어 차이가 의도된 것인지 불분명.
11. **`recommendCommands`에 publishing gate 누락**: smoke 프로젝트의 `quality` script(`bash scripts/measure-quality.sh`)가 권장 검증 명령 표에 안 들어감. lint/typecheck/test/build/dev만 봄. `publishing gate`는 `frontend-handoff.md` 표에는 있으나 자동 감지에는 없음.
12. **`docs/delivery-lifecycle.md`가 Frontend agent 신규 구조 미반영**: 9번(Publishing)과 13번(Frontend development) 단계가 분리되어 있고, 이 둘이 같은 Frontend agent 책임이라는 매핑이 빠짐. agent 정의와 lifecycle 문서가 살짝 따로 노는 인상.

### 위험도가 낮은 항목

13. **인자 처리 비대칭**: `inspect-frontend-project.mjs`는 `--project` 없이 cwd, `inspect-api-spec.mjs`는 `--spec` 필수, `create-api-integration-map.mjs`는 모든 인자 필수. 사용자 관점에서 통일성은 약함. 큰 문제는 아님.
14. **`fetch 사용 흔적` 패턴**: `\bfetch\s*\(`라 import문, 변수명, 주석에서 우연히 매칭될 수 있음. False positive 가능. 실용 영향은 작음.

## 수정 필요 항목

다음 우선순위 순으로 정리합니다.

| 우선순위 | 항목 | 파일/위치 | 작업 |
| --- | --- | --- | --- |
| 1 | YAML OpenAPI 파싱 추가 | `scripts/inspect-api-spec.mjs:98-113` | 가벼운 YAML 파서(예: `js-yaml`) 옵션 의존 또는 `yaml` 노드 표준 모듈 검토 후 JSON과 동일 흐름으로 통합 |
| 1 | `$ref` 파라미터 resolve | `scripts/inspect-api-spec.mjs:248-275` | `components.parameters` / `components.schemas`를 따라가 `in`, `schema`, `required` 채우기 |
| 1 | profile에서 timestamp 옵션화 또는 제거 | `scripts/inspect-frontend-project.mjs:283` | 기본은 timestamp 제거, `--include-timestamp` 옵션으로만 추가 |
| 2 | profile JSON 스키마 문서 | `scripts/README.md` 신규 또는 `docs/` 추가 | 두 inspect 스크립트의 출력 JSON 형태(키, 타입, 의미)를 표로 정리 |
| 2 | publish-harness-codex 명령 예시 cross-platform | `integrations/publish-harness-codex.md:65-105` | PowerShell 예시 옆에 bash/zsh 예시 1세트 추가 |
| 2 | `recommendCommands`에 publishing gate 항목 추가 | `scripts/inspect-frontend-project.mjs:244-252` | `scripts.quality`, `scripts.publishing`, `scripts["measure-quality"]` 등을 추가 감지 |
| 3 | `scanFiles` 한계 노출 | `scripts/inspect-frontend-project.mjs:142-152` | 500 한계에 도달했으면 profile에 노트 추가, 또는 limit을 옵션으로 노출 |
| 3 | 테스트 디렉터리 감지 확장 | `scripts/inspect-frontend-project.mjs:236-238` | `__tests__`, `e2e`, `playwright`, `cypress`, `test` 추가 |
| 3 | api-integration-map 템플릿 ↔ 스크립트 출력 차이 안내 | `templates/api-integration-map.md` 또는 스크립트 출력 상단 메모 | "응답 schema 컬럼은 수동 채우기" 한 줄 추가 |
| 4 | delivery-lifecycle와 frontend-agent 매핑 | `docs/delivery-lifecycle.md` | 9번(Publishing), 13번(Frontend development) 옆에 `Frontend agent 담당` 표시 |
| 4 | Markdown endpoint 패턴 검증 케이스 | `scripts/inspect-api-spec.mjs:190` | smoke fixture에 표 기반/코드블록 기반 endpoint 샘플 두 개 추가 후 검증 |

## 다음 우선순위

다음 한 사이클(다음 1~2 작업)에서 처리하는 것을 권장합니다.

1. **YAML OpenAPI 지원** — 사용자가 가장 빨리 막히는 지점. 한 가지 의존성 추가로 해결 가능.
2. **`$ref` 파라미터 resolve** — smoke 결과에서 즉시 보이는 품질 이슈. 자동 산출물의 정확도가 한 단계 올라감.
3. **profile timestamp 제거 / 스키마 문서화** — 도구 결정성 회복 + 외부 도구 호환성 확보. 두 가지가 함께 가는 것이 좋음.

## 나중에 할 일

급하지 않지만 정착 단계에서 다루면 좋은 항목들입니다.

- 3개 스크립트에 대한 Vitest unit test 추가 (특히 OpenAPI 케이스, `$ref` resolve, Markdown 추출)
- 모노레포(yarn/pnpm/bun workspace) 환경 감지 — `package.json`의 `workspaces`, `pnpm-workspace.yaml` 등
- 패키지 매니저별 실행 명령 hint(`npm run` / `pnpm` / `yarn` / `bun run`) 자동 추론
- `frontend-handoff.md`와 `frontend-connect-plan.md`의 `오픈 이슈` 표를 ID prefix로 통일(현재 `FE-OPEN-`, `FE-HANDOFF-`, `FE-SCREEN-OPEN-`로 다름 — 의도된 분리이긴 하나 cross-link할 때 헷갈릴 수 있음)
- `integrations/publish-harness-codex.md`의 smoke 결과 섹션을 별도 `docs/reviews/` 또는 `docs/smoke-results/`로 분리(연동 가이드와 운영 로그가 한 파일에 섞여 있어 길어지면 분리 필요)
- React 외 프레임워크(Next App Router, Vue, Svelte) 케이스에서 `inspect-frontend-project.mjs`의 라우팅/상태 감지가 어떻게 동작하는지 smoke 추가 검증
- Component inventory 자동 채움 도구(예: `inspect-components.mjs`) — 현재는 수동만 가능

## 참고 — Smoke 결과

리뷰 중 재현한 산출물은 다음 위치에 있습니다(임시 경로, 보존 필요 없음).

```text
%TEMP%\vpk-smoke\frontend-project-profile.md
%TEMP%\vpk-smoke\frontend-project-profile.json
%TEMP%\vpk-smoke\api-spec-profile.md
%TEMP%\vpk-smoke\api-spec-profile.json
%TEMP%\vpk-smoke\api-integration-map.md
```

3개 산출물 모두 사람이 채워야 하는 빈칸은 명시적으로 `확인 필요`로 표시되었고, OpenAPI 자동 추출 가능한 항목(method, path, operationId, security scheme, error status)은 채워졌습니다. 자동 채움/수동 채움 비율은 적절합니다.
