---
name: integration-testing
description: 모듈 간 흐름, API 계약, DB 동작, 브라우저 흐름, 배포 유사 동작에 대한 통합 테스트를 작성하고 검토합니다.
---

# 통합테스트

QA agent의 Integration 트랙에서 사용하는 스킬입니다. 구현 후·배포 직전에 호출되어 통합 시나리오 작성·e2e 검증·테스트 통과 보고서 작성·결함 메모 작성을 수행합니다. 사내 표준은 `standards/qa/qa-quality.md`를 단일 출처로 따릅니다.

## 입력 산출물

- backend·frontend의 통합 테스트 (Testcontainers·e2e)
- 통합 테스트 결과
- frontend agent의 `frontend-handoff.md` "QA에 넘길 사항" (4 항목)
- application-architecture의 상태 흐름·정합성 체크 결과
- API 명세 (`docs/openapi.yaml`)
- 배포 환경 정보 (release agent Environment 트랙)
- Unit 트랙의 검토 메모·추가 케이스 제안

## 산출물

- 통합 테스트 시나리오 (`templates/test-plan.md` 양식, `TC-XXX` ID)
- e2e 테스트 케이스
- 테스트 통과 보고서 (`docs/qa-report.md` — `qa-quality.md` 섹션 7 양식, 8 필수 항목)
- 결함 메모 (backend/frontend로 돌려보냄, `qa-quality.md` 섹션 8 양식, 7 필수 항목)

## 사내 컨벤션 적용

자세한 내용은 `standards/qa/qa-quality.md`를 참조합니다. 아래 목록은 핵심 룰의 요약이며 `qa-quality.md`가 정의적 단일 출처입니다.

- Testcontainers: 백엔드 통합은 `Testcontainers` 환경 (backend-quality.md 섹션 8 인용, H2 금지).
- 빌드·배포 명령: `./gradlew test`, `npm test`, e2e 도구 — release-quality.md 섹션 7 인용.
- 테스트 케이스 ID: `TC-XXX` (`qa-quality.md` 섹션 3).
- 결함 분류: `Severity` (Blocker/Critical/Major/Minor) + Priority (`qa-quality.md` 섹션 4).
- 결함 메모 양식: `qa-quality.md` 섹션 8 (7 필수 항목).
- 테스트 통과 보고서: `qa-quality.md` 섹션 7 (8 필수 항목, 게이트 판정 포함).
- 회귀 테스트: 매 빌드마다 (`qa-quality.md` 섹션 10).
- 배포 게이트: 통합 테스트 통과 + 보고서 = release-quality.md 섹션 2 입력.

## 작업 절차

1. 여러 컴포넌트가 함께 동작해야 하는 흐름을 식별합니다 (모듈 간·API·DB·브라우저).
2. 통합 시나리오 작성 (`templates/test-plan.md` 양식, `TC-XXX` ID).
3. 준비·데이터·실행·기대 결과를 정의합니다.
4. e2e 테스트 케이스 추가 (브라우저·시스템 흐름).
5. 기존 통합 테스트 또는 e2e 도구를 사용합니다 (Playwright·Cypress 등 회사 표준 따름).
6. 현실적인 성공 경로와 실패 경로를 검증합니다.
7. 결함 발견 시 `BUG-XXX` ID 부여, Severity/Priority 분류, 결함 메모 작성 (`qa-quality.md` 섹션 8 양식).
8. 결함 fix 후 회귀 검증 (`qa-quality.md` 섹션 10).
9. 테스트 통과 보고서 작성 (`docs/qa-report.md` — `qa-quality.md` 섹션 7 양식, 게이트 판정 Pass/Fail/Pass-with-known-issues).

## 검증

- 모든 통합 테스트 통과.
- e2e 테스트 케이스 통과.
- 결함 모두 fix 또는 known issue 등록.
- 테스트 통과 보고서 8 필수 항목 작성 완료.
- 회귀 테스트 통과.

## 인수인계

**backend·frontend agent로** 결함 메모 (`BUG-XXX`, Severity/Priority, 재현 절차, 담당 agent).

**release agent로** 테스트 통과 보고서 (`docs/qa-report.md`) — 배포 게이트 입력.

## 완료 기준

작업 완료 판단 시 qa-agent.md "완료 기준" 섹션의 Integration 트랙 항목을 사용합니다.

- 통합 시나리오 작성 완료.
- e2e 케이스 통과.
- 결함 fix 또는 known issue 등록.
- 테스트 통과 보고서 (`docs/qa-report.md`) 작성 완료.
- 회귀 테스트 통과.
- release agent 인수인계 완료.
