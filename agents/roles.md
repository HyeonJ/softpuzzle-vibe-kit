# 에이전트 역할

에이전트는 고정된 조직원이 아니라 작업을 나누기 위한 역할 경계입니다. 작업 범위가 명확하고 결과물을 검토할 수 있을 때 사용합니다.

## 역할

- PM agent: 프로젝트 착수, R&R, WBS, 마일스톤 추적, 리스크 로그를 담당합니다.
- Planner agent: 요구사항, 사용자 스토리, IA, 화면 목록, 인수 기준을 담당합니다.
- Designer agent: Figma 작업, 디자인 시스템 사용, UI 검토, 접근성 검토를 담당합니다.
- Architect agent: 시스템 아키텍처, 보안, 성능, 런타임 구조, 배포 구조를 담당합니다.
- Security agent: 보안 정책 결정, 인증/세션 정책, 토큰 저장 위치, CORS 허용 정책, 시크릿 관리 표준을 담당합니다 (Architect agent와 협업하거나 Architect 내부 영역으로 통합 가능).
- Application Architecture agent: 프로그램 상세 설계, 정책, 권한, 상태 흐름, DB 설계, 데이터 계약 정합성을 담당합니다.
- Backend agent: API 구현, DB 연동, 서비스 로직, 백엔드 테스트를 담당합니다.
- Frontend agent: 퍼블리싱, 화면 구현, 라우팅, 상태 관리, API 연동, 폼/권한 처리, 프론트 테스트를 담당합니다.
- QA agent: 테스트 전략, 테스트 케이스, 단위/통합/e2e 테스트 범위를 담당합니다.
- Release agent: 배포 체크리스트, 릴리즈 노트, 롤백 계획, 운영 인수인계를 담당합니다.

## Frontend agent와 퍼블리싱

Frontend agent는 기본적으로 퍼블리싱과 프론트 앱 개발을 모두 담당합니다.

- 퍼블리싱 트랙: Figma/화면정의서 기반 UI 구현, 반응형, 접근성, 디자인 토큰, 디자인 QA
- 앱 프론트 트랙: 라우팅, 상태 관리, API 연동, 폼 검증, 권한 처리, 테스트

Figma URL 또는 handoff spec이 있는 경우 Frontend agent는 `publish-harness-codex` 사용을 우선 검토합니다.

참조:

```text
agents/frontend-agent.md
agents/application-architecture-agent.md
integrations/publish-harness-codex.md
```

## 위임 규칙

- 명확한 파일 또는 산출물 소유권이 있는 작업만 위임합니다.
- 최종 결정은 메인 오케스트레이션 흐름에서 유지합니다.
- 각 에이전트는 변경 파일, 생성 산출물, 남은 질문, 수행한 검증을 보고해야 합니다.
