---
name: publishing
description: Figma 또는 화면정의서를 기반으로 정적 UI, 반응형 레이아웃, 시맨틱 마크업, 접근성, 디자인 반영, 품질 게이트를 다룹니다.
---

# 퍼블리싱

이 스킬은 Frontend agent가 디자인 기반 UI를 구현할 때 사용하는 퍼블리싱 트랙입니다.

Frontend agent는 하나지만, 작업 성격에 따라 아래 두 스킬을 함께 사용합니다.

- `publishing`: 디자인을 UI 산출물로 정확히 구현하는 기준
- `frontend-development`: 라우팅, 상태, API, 폼, 권한, 앱 동작을 구현하는 기준

## 사용 시점

다음 작업에서는 이 스킬을 우선 사용합니다.

- Figma 디자인을 화면 또는 섹션으로 구현할 때
- 화면정의서를 기준으로 HTML/CSS/컴포넌트를 구현할 때
- 반응형 레이아웃과 접근성 기준을 잡을 때
- 디자인 토큰을 적용해야 할 때
- 디자인 QA 또는 퍼블리싱 품질 게이트가 필요할 때

## publish-harness-codex 사용

Figma URL 또는 handoff spec이 있는 경우 `publish-harness-codex` 사용을 우선 검토합니다.

참조 문서:

```text
integrations/publish-harness-codex.md
```

권장 기본 경로:

```text
~/workspace/publish-harness-codex
```

환경변수:

```text
PUBLISH_HARNESS_CODEX_DIR
```

## 참조 문서

```text
standards/frontend/frontend-quality.md
templates/frontend/frontend-screen-checklist.md
templates/frontend/component-inventory.md
templates/frontend/frontend-handoff.md
```

## 산출물

- 퍼블리싱된 UI 구조
- 반응형 레이아웃 구현
- 디자인 토큰 적용 결과
- 접근성 메모
- 브라우저 호환성 메모
- 디자인 반영 체크리스트
- 품질 게이트 결과
- 남은 디자인/구현 이슈

## 작업 절차

1. 입력이 Figma URL, handoff spec, 화면정의서 중 무엇인지 확인합니다.
2. `publish-harness-codex` 사용 가능 여부를 확인합니다.
3. 디자인 토큰, 컴포넌트 규칙, 화면 상태, 반응형 기준을 확인합니다.
4. 화면을 섹션 또는 컴포넌트 단위로 나눕니다.
5. 시맨틱하고 접근 가능한 마크업으로 구현합니다.
6. 모바일 우선으로 작성하고 tablet/desktop을 확장합니다.
7. 텍스트가 이미지 안에 baked-in 되지 않도록 합니다.
8. 가능한 품질 게이트를 실행합니다.
9. 실패 또는 SKIP 사유를 기록합니다.
10. API, 라우팅, 상태 작업이 필요하면 `frontend-development` 스킬로 이어갑니다.

## 완료 기준

- 화면정의서 또는 Figma의 핵심 구조가 반영되었습니다.
- 주요 breakpoint에서 레이아웃이 깨지지 않습니다.
- 디자인 토큰을 우선 사용했습니다.
- 시맨틱 HTML과 기본 접근성 기준을 지켰습니다.
- 로딩, 빈 상태, 오류 상태 등 필요한 UI 상태가 식별되었습니다.
- 실행 가능한 품질 게이트 결과가 기록되었습니다.
- 앱 동작 개발로 넘길 이슈가 명확히 정리되었습니다.

