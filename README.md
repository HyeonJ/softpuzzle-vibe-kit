# Softpuzzle Vibe Kit

회사 프로젝트를 기획부터 배포까지 단계별로 수행하기 위한 **Codex / Claude Code 듀얼 플러그인**입니다. PM · 기획 · 디자인 · 아키텍처 · 개발 · QA · 릴리즈 단계가 각각 독립적인 스킬 · 에이전트 · 템플릿 · 표준으로 분리되어 있어, 한 프로젝트에 필요한 단계만 골라 쓸 수 있습니다.

## 누가 왜 쓰는가

- 새 프로젝트 의뢰가 들어왔을 때 "어떤 단계부터, 무엇을 산출물로, 어떤 양식으로" 시작할지 막막한 경우.
- 회사 내 여러 프로젝트가 같은 표준(코딩 컨벤션 · API 응답 포맷 · 테스트 환경 · 산출물 양식)을 따라가게 하고 싶은 경우.
- LLM 에이전트에게 작업을 맡길 때 임의 결정 없이 사내 표준을 따르게 하고 싶은 경우.

## 동작 환경

| 환경 | 매니페스트 | 진입점 |
|---|---|---|
| Claude Code | `.claude-plugin/plugin.json` | 슬래시 커맨드 (`/charter`, `/requirements`, `/wbs`, `/erd`, `/api-spec`) |
| Codex | `.codex-plugin/plugin.json` | 디렉터리 자동 인식 |

`skills/`, `agents/`, `templates/`, `standards/`, `scripts/`, `integrations/`는 두 환경이 공유합니다. 환경 고유 기능(hooks, slash commands 포맷)만 각자 추가합니다.

## 핵심 에이전트와 역할

| 에이전트 | 담당 | 작성 상태 |
|---|---|---|
| PM | 프로젝트 착수, R&R, WBS, 마일스톤 추적, 리스크 로그 | 골격 |
| Planner | 요구사항, 사용자 스토리, IA, 화면 목록, 인수 기준 | 골격 |
| Designer | Figma 작업, 디자인 시스템 사용, UI 검토, 접근성 검토 | 골격 |
| Architect | 시스템 아키텍처, 보안, 성능, 런타임 구조, 배포 구조 | 골격 |
| Security | 보안 정책, 인증/세션 정책, 토큰 저장 위치, CORS, 시크릿 관리 표준 | 미작성 |
| Application Architecture | 프로그램 상세 설계, 정책, 권한, 상태 흐름, DB 설계, 데이터 계약 정합성 | ✅ 작성됨 |
| Backend | API 구현, DB 연동, 서비스 로직, 백엔드 테스트 | ✅ 작성됨 |
| Frontend | 퍼블리싱, 화면 구현, 라우팅, 상태 관리, API 연동, 폼/권한, 프론트 테스트 | ✅ 작성됨 |
| QA | 테스트 전략, 테스트 케이스, 단위/통합/e2e 테스트 범위 | 골격 |
| Release | 배포 체크리스트, 릴리즈 노트, 롤백 계획, 운영 인수인계 | 골격 |

각 에이전트의 상세 역할 · 사용 스킬 · 인수인계 양식은 `agents/*.md` 또는 `agents/roles.md`에서 확인합니다.

## 설치

### Claude Code

```text
/plugin marketplace add HyeonJ/softpuzzle-vibe-kit
/plugin install softpuzzle-vibe-kit@softpuzzle-vibe-kit
```

설치 후 슬래시 커맨드(`/charter`, `/requirements`, `/wbs`, `/erd`, `/api-spec`)로 단계별 작업을 시작합니다.

### Codex 또는 일반 clone

```bash
git clone https://github.com/HyeonJ/softpuzzle-vibe-kit.git
cd softpuzzle-vibe-kit
npm install   # 자동화 스크립트 사용 시
```

Codex는 디렉터리 안에서 실행하면 `.codex-plugin/plugin.json`을 자동 인식합니다.

## 첫 사용 흐름

새 프로젝트를 시작한다고 가정한 표준 흐름:

1. **착수 보고서** — `/charter` (Claude Code) 또는 PM 에이전트에 프로젝트 브리프 작성 요청. 결과는 `templates/project-brief.md` 양식.
2. **요구사항 정의** — `/requirements` 또는 Planner 에이전트. 기능 / 비기능 요구사항을 `templates/requirements.md`에 정리.
3. **WBS** — `/wbs`. 단계 · 작업 패키지 · 의존성을 `templates/wbs.md`에 정리.
4. **설계** — Application Architecture 에이전트가 `templates/detail-design.md`, `templates/db-design.md`, `templates/api-contract-handoff.md`를 채움.
5. **개발** — Backend / Frontend 에이전트가 각자의 `agents/*.md` 작업 절차에 따라 코드 구현.
6. **테스트 · 배포** — QA / Release 에이전트 (작성 진행 중).

각 단계의 LLM 에이전트는 사내 표준(`standards/`)을 자동으로 따르고, 다음 단계로 넘기는 인수인계 메모를 남깁니다.

## 디렉터리 구조

```text
softpuzzle-vibe-kit/
├─ .claude-plugin/        # Claude Code 매니페스트
├─ .codex-plugin/         # Codex 매니페스트
├─ commands/              # Claude Code 슬래시 커맨드
├─ agents/                # 역할별 에이전트 정의
├─ skills/                # 단계별 작업 절차 (16 skills)
├─ standards/             # 사내 품질 표준
├─ templates/             # 산출물 양식
├─ integrations/          # 외부 도구 연동 (publish-harness-codex 등)
├─ scripts/               # 자동화 스크립트
├─ docs/                  # 진행 현황(project-progress.md), 자동화 사용법(scripts-usage.md), 생명주기(delivery-lifecycle.md)
├─ AGENTS.md              # Codex용 가이드
├─ CLAUDE.md              # Claude Code용 가이드
└─ README.md              # 본 문서
```

## 라이선스

MIT (`.claude-plugin/plugin.json` / `.codex-plugin/plugin.json` 참조).
