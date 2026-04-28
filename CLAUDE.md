# Softpuzzle Vibe Kit — Claude Code Guide

본 문서는 Claude Code 환경에서 이 플러그인을 사용할 때의 가이드입니다. Codex 사용자는 `AGENTS.md`를 참조하세요. 두 문서의 핵심 규칙은 동일하며, Claude Code 특화 항목만 본 문서에 추가됩니다.

## 프로젝트 목적

이 저장소는 소프트웨어 프로젝트를 기획부터 배포까지 수행하기 위한 플러그인 Softpuzzle Vibe Kit을 담고 있습니다.

주 사용자는 한국 실무자입니다. 사용자에게 노출되는 설명, 기본 프롬프트, 템플릿 본문, 산출물 작성 가이드는 한글로 작성합니다. 단, 플러그인 이름, 스킬 이름, 디렉터리명, 파일명, JSON key, 스크립트 식별자는 영어를 유지합니다.

## 우선순위

1. 글로벌 `~/.claude/CLAUDE.md` (사내 코딩 컨벤션 — Java/Spring Boot, 프론트엔드, API 응답 포맷, 커밋 메시지 등) — **항상 적용**.
2. 본 `CLAUDE.md` (Claude Code 특화 가이드).
3. 각 `skills/*/SKILL.md` (단계별 작업 절차).
4. `AGENTS.md` (Codex 호환 가이드, Claude Code도 보조로 읽음).

## 슬래시 커맨드 진입점

다음 슬래시 커맨드로 단계별 작업을 시작할 수 있습니다.

- `/charter` — 프로젝트 착수 보고서 작성 (`pm-governance` skill)
- `/requirements` — 요구사항 정의서 작성 (`requirements-definition` skill)
- `/wbs` — WBS 작성 (`wbs-planning` skill)
- `/erd` — ERD 및 DB 설계 (`db-design` skill)
- `/api-spec` — API 명세서 작성 (`api-development` skill)

## 스킬 사용 규칙

- 모든 스킬 디렉터리는 `SKILL.md`를 가지며 frontmatter(`name`, `description`)가 트리거 역할을 합니다.
- 스킬은 단계별로 모듈화돼 있어 작업 범위가 명확할 때만 호출합니다.
- 스킬 본문에 명시된 산출물은 `templates/`의 형식을 따릅니다.

## 산출물 위치 규칙

- 단계별 산출물 양식: `templates/`
- 품질 기준 / 인수인계 규칙: `standards/`
- 외부 시스템 연동 자산: `integrations/`
- 자동화 스크립트: `scripts/`, `tools/`

## 구조 규칙

- 마켓플레이스 배포 단위는 하나의 플러그인으로 유지합니다.
- 업무 방법론과 절차는 `skills/` 아래에 모듈형으로 둡니다.
- 반복 가능한 자동화는 `scripts/` 또는 `tools/`에 둡니다.
- 재사용 가능한 산출물 양식은 `templates/`에 둡니다.
- 공통 품질 기준과 인수인계 규칙은 `standards/`에 둡니다.
- 역할 정의와 위임 기준은 `agents/`에 둡니다.
- 고객사별 실제 프로젝트 데이터는 이 플러그인에 넣지 않습니다.

## 듀얼 환경

본 플러그인은 Claude Code와 Codex 두 환경에서 동일하게 동작합니다.

- Claude Code 매니페스트: `.claude-plugin/plugin.json`
- Codex 매니페스트: `.codex-plugin/plugin.json`
- skills, agents, templates, standards, scripts는 두 환경이 공유합니다.
- 환경 고유 기능(hooks, slash commands)만 각자 추가합니다.

## 편집 규칙

- 요청받은 단계나 기능에 맞춰 변경 범위를 좁게 유지합니다.
- 배포된 식별자(plugin name, skill name)는 가볍게 이름을 바꾸지 않습니다.
- 한 영역을 수정하면서 관련 없는 템플릿이나 스킬을 대규모로 다시 쓰지 않습니다.
- 한글 본문은 UTF-8로 보존합니다.
- 코드와 파일명은 특별한 이유가 없으면 ASCII를 사용합니다.

## 검증

플러그인 메타데이터를 수정한 뒤에는:

- `.claude-plugin/plugin.json`과 `.codex-plugin/plugin.json` 모두 JSON으로 파싱됩니다.
- 메타데이터 확정 작업이라면 `[TODO:`나 `example` placeholder가 남아 있는지 확인합니다.

스킬을 추가하거나 수정한 뒤에는:

- 해당 스킬에 `SKILL.md`가 있는지 확인합니다.
- frontmatter에 `name`과 `description`이 있는지 확인합니다.
- 스킬 이름과 디렉터리명이 일치하는지 확인합니다.
