# Softpuzzle Vibe Kit

Softpuzzle Vibe Kit은 Claude Code와 Codex로 소프트웨어 프로젝트를 기획부터 배포까지 단계별로 수행하기 위한 플러그인 골격입니다.

이 플러그인은 하나의 거대한 지침 파일로 모든 일을 처리하지 않습니다. PM, 요구사항, IA, 디자인, 아키텍처, 개발, 테스트, 배포 단계를 각각 독립적인 스킬과 템플릿으로 나누어 범용 프로젝트에 재사용할 수 있도록 구성합니다.

## 사용 환경

이 키트는 Claude Code와 Codex 두 환경에서 동일하게 동작합니다.

- Claude Code 매니페스트: `.claude-plugin/plugin.json`
- Codex 매니페스트: `.codex-plugin/plugin.json`
- `skills/`, `agents/`, `templates/`, `standards/`, `scripts/`, `integrations/`는 두 환경이 공유합니다.
- 환경 고유 기능(hooks, slash commands)만 각자 추가합니다.

Claude Code에서는 `commands/` 디렉터리의 슬래시 커맨드(`/charter`, `/requirements`, `/wbs`, `/erd`, `/api-spec`)로 단계별 작업을 시작할 수 있습니다.

## 구조

```text
softpuzzle-vibe-kit/
├─ .codex-plugin/
│  └─ plugin.json
├─ AGENTS.md
├─ agents/
│  └─ roles.md
├─ assets/
├─ docs/
│  ├─ delivery-lifecycle.md
│  └─ implementation-roadmap.md
├─ integrations/
│  └─ publish-harness-codex.md
├─ scripts/
├─ skills/
│  ├─ pm-governance/
│  ├─ wbs-planning/
│  ├─ requirements-definition/
│  ├─ ia-screen-planning/
│  ├─ figma-design/
│  ├─ system-architecture/
│  ├─ security-performance/
│  ├─ dev-environment/
│  ├─ publishing/
│  ├─ detail-design/
│  ├─ db-design/
│  ├─ api-development/
│  ├─ frontend-development/
│  ├─ unit-testing/
│  ├─ integration-testing/
│  └─ release-deployment/
├─ standards/
├─ templates/
└─ tools/
```

## 프론트엔드 작업 자산

Frontend agent는 퍼블리싱과 프론트 앱 개발을 함께 담당합니다.

관련 문서:

```text
agents/frontend-agent.md
integrations/publish-harness-codex.md
standards/frontend/frontend-quality.md
templates/frontend/frontend-connect-plan.md
templates/frontend/api-integration-map.md
templates/frontend/frontend-screen-checklist.md
templates/frontend/component-inventory.md
templates/frontend/frontend-handoff.md
docs/frontend-agent-profile-schema.md
docs/project-progress.md
```

## 애플리케이션 아키텍처 작업 자산

Application Architecture agent는 프로그램 상세 설계, 정책, 권한, DB 설계, 데이터 계약 정합성을 함께 담당합니다.

관련 문서:

```text
agents/application-architecture-agent.md
skills/detail-design/SKILL.md
skills/db-design/SKILL.md
templates/detail-design.md
templates/application-data-contract.md
templates/api-contract-handoff.md
templates/db-design.md
```

스크립트 사용 전 최초 1회 의존성을 설치합니다.

```bash
npm install
```

프론트 프로젝트 분석:

```bash
node scripts/inspect-frontend-project.mjs --project <frontend-project>
```

기본 출력:

```text
<frontend-project>/docs/frontend-project-profile.md
```

JSON 출력:

```bash
node scripts/inspect-frontend-project.mjs --project <frontend-project> --json
```

API 명세 분석:

```bash
node scripts/inspect-api-spec.mjs --spec <api-spec>
```

기본 출력:

```text
<spec-dir>/api-spec-profile.md
```

JSON 출력:

```bash
node scripts/inspect-api-spec.mjs --spec <api-spec> --json
```

API 연동 맵 생성:

```bash
node scripts/inspect-frontend-project.mjs --project ./app --json > ./docs/frontend-project-profile.json

node scripts/inspect-api-spec.mjs --spec ./docs/openapi.json --json > ./docs/api-spec-profile.json

node scripts/create-api-integration-map.mjs \
  --frontend-profile ./docs/frontend-project-profile.json \
  --api-profile ./docs/api-spec-profile.json \
  --output ./docs/api-integration-map.md
```

Windows PowerShell에서 `>`가 UTF-16 파일을 만들면 JSON 입력이 깨질 수 있습니다. 이 경우 다음처럼 UTF-8로 저장합니다.

```powershell
node scripts/inspect-frontend-project.mjs --project ./app --json |
  Set-Content -Encoding UTF8 ./docs/frontend-project-profile.json

node scripts/inspect-api-spec.mjs --spec ./docs/openapi.yaml --json |
  Set-Content -Encoding UTF8 ./docs/api-spec-profile.json
```

프론트엔드 에이전트 보조 스크립트 smoke 검증:

```bash
npm run check
npm run smoke:frontend-agent
```

JSON profile 규격은 `docs/frontend-agent-profile-schema.md`에서 확인합니다.

## 설계 원칙

- 플러그인은 마켓플레이스 배포 단위와 진입점 역할을 합니다.
- 스킬은 각 업무 영역의 방법론과 작업 절차를 담당합니다.
- 도구는 문서 생성, 검증, 변환, 품질 게이트처럼 반복 가능한 자동화를 담당합니다.
- 에이전트 정의는 PM, 기획자, 디자이너, 아키텍트, 개발자, QA, 릴리즈 담당자 같은 역할 경계를 설명합니다.
- 템플릿은 프로젝트 산출물의 기본 형식을 제공합니다.
- 표준 문서는 산출물 품질과 단계 간 인수인계 기준을 정의합니다.

## 첫 번째 목표

1. 플러그인 이름, 표시 이름, 마켓플레이스 설명을 확정합니다.
2. 각 단계별 `skills/*/SKILL.md`를 실제 업무에 사용할 수 있는 수준으로 구체화합니다.
3. 프로젝트 상태 파일 규격을 정해 스킬 간 인수인계가 가능하게 만듭니다.
4. 템플릿 기반 산출물 생성 스크립트를 추가합니다.
5. 문서 흐름이 안정된 뒤 Figma, GitHub, Jira, Notion 같은 외부 연동을 붙입니다.

